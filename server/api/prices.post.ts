/// <reference types="@cloudflare/workers-types" />

import { FLAT_MODELS, ML_MODELS, STOREY_RANGES, TOWNS } from '~/utils/lists';
import type { FlatModel, MLModel, StoreyRange, Town } from '~/utils/lists';

const DEFAULT_PREDICTION_MONTH_START = '2021-02';
const DEFAULT_PREDICTION_MONTH_END = '2022-02';

type NormalizedRequest = {
	mlModel: MLModel;
	town: Town;
	storeyRange: StoreyRange;
	flatModel: FlatModel;
	floorAreaSqm: number;
	leaseCommenceYear: number;
};

type PriceQueryRow = {
	intercept_map: number;
	month_map: number;
	storey_range_map: number;
	floor_area_sqm_map: number;
	lease_commence_date_map: number;
	month_name: string;
	month_multiplier: number;
	town_map: number;
	flat_model_map: number;
	storey_range_multiplier: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function isOneOf<T extends string>(value: string, options: readonly T[]): value is T {
	return options.includes(value as T);
}

function readNumericField(value: unknown, fieldName: string): number {
	const numericValue = Number(value);
	if (!Number.isFinite(numericValue)) {
		throw new Error(`Database field ${fieldName} is not a finite number`);
	}
	return numericValue;
}

function roundToTwo(value: number): number {
	return Math.round((value + Number.EPSILON) * 100) / 100;
}

function normalizePredictionRequest(
	input: unknown
): { ok: true; value: NormalizedRequest } | { ok: false; error: string } {
	if (!isRecord(input)) {
		return { ok: false, error: 'Invalid request body.' };
	}

	const mlModel = input.mlModel;
	const town = input.town;
	const storeyRange = input.storeyRange;
	const flatModel = input.flatModel;
	const floorAreaSqm = input.floorAreaSqm;
	const leaseCommenceYear = input.leaseCommenceYear;

	if (typeof mlModel !== 'string' || !isOneOf(mlModel, ML_MODELS)) {
		return { ok: false, error: 'Invalid ML model.' };
	}

	if (typeof town !== 'string' || !isOneOf(town, TOWNS)) {
		return { ok: false, error: 'Invalid town.' };
	}

	if (typeof storeyRange !== 'string' || !isOneOf(storeyRange, STOREY_RANGES)) {
		return { ok: false, error: 'Invalid storey range.' };
	}

	if (typeof flatModel !== 'string' || !isOneOf(flatModel, FLAT_MODELS)) {
		return { ok: false, error: 'Invalid flat model.' };
	}

	if (typeof floorAreaSqm !== 'number' || !Number.isFinite(floorAreaSqm)) {
		return { ok: false, error: 'Invalid floor area.' };
	}

	if (
		typeof leaseCommenceYear !== 'number' ||
		!Number.isInteger(leaseCommenceYear) ||
		leaseCommenceYear < 1960 ||
		leaseCommenceYear > 2022
	) {
		return { ok: false, error: `Lease commence year must be between 1960 and 2022.` };
	}

	return {
		ok: true,
		value: {
			mlModel,
			town,
			storeyRange,
			flatModel,
			floorAreaSqm: Math.max(20, Math.min(300, Math.round(floorAreaSqm))),
			leaseCommenceYear
		}
	};
}

export default defineEventHandler(async (event) => {
	let requestBody: unknown;

	try {
		requestBody = await readBody(event);
	} catch {
		throw createError({
			statusCode: 400,
			statusMessage: 'Invalid JSON request body.'
		});
	}

	const normalizedRequest = normalizePredictionRequest(requestBody);
	if (!normalizedRequest.ok) {
		throw createError({
			statusCode: 400,
			statusMessage: normalizedRequest.error
		});
	}

	const { mlModel, town, flatModel, storeyRange, floorAreaSqm, leaseCommenceYear } =
		normalizedRequest.value;

	try {
		const db = event.context.cloudflare?.env?.DB as D1Database | undefined;
		if (!db) {
			throw new Error('Cloudflare D1 binding is not available.');
		}
		const { results } = await db
			.prepare(
				`SELECT
					ml_models.intercept_map,
					ml_models.month_map,
					ml_models.storey_range_map,
					ml_models.floor_area_sqm_map,
					ml_models.lease_commence_date_map,
					months_ordinal.name AS month_name,
					months_ordinal.value AS month_multiplier,
					towns_onehot.value AS town_map,
					flat_models_onehot.value AS flat_model_map,
					storey_ranges_ordinal.value AS storey_range_multiplier
				FROM ml_models
				JOIN towns_onehot ON ml_models.name = towns_onehot.ml_model
				JOIN flat_models_onehot ON ml_models.name = flat_models_onehot.ml_model
				JOIN storey_ranges_ordinal ON storey_ranges_ordinal.name = ?6
				JOIN months_ordinal ON months_ordinal.name BETWEEN ?4 AND ?5
				WHERE ml_models.name = ?1
					AND towns_onehot.name = ?2
					AND flat_models_onehot.name = ?3
				ORDER BY months_ordinal.value ASC;`
			)
			.bind(
				mlModel,
				town,
				flatModel,
				DEFAULT_PREDICTION_MONTH_START,
				DEFAULT_PREDICTION_MONTH_END,
				storeyRange
			)
			.all<PriceQueryRow>();

		const [first] = results;
		if (!first) {
			throw createError({
				statusCode: 500,
				statusMessage: 'No prediction data found for the given parameters.'
			});
		}

		// All terms except month_multiplier are constant across rows. Compute them once.
		const baseValue =
			readNumericField(first.intercept_map, 'intercept_map') +
			readNumericField(first.town_map, 'town_map') +
			readNumericField(first.storey_range_multiplier, 'storey_range_multiplier') *
				readNumericField(first.storey_range_map, 'storey_range_map') +
			floorAreaSqm * readNumericField(first.floor_area_sqm_map, 'floor_area_sqm_map') +
			readNumericField(first.flat_model_map, 'flat_model_map') +
			leaseCommenceYear *
				readNumericField(first.lease_commence_date_map, 'lease_commence_date_map');
		const monthCoefficient = readNumericField(first.month_map, 'month_map');

		const predictions = results.map((row) => {
			const predictedRaw =
				baseValue +
				readNumericField(row.month_multiplier, 'month_multiplier') * monthCoefficient;

			if (!Number.isFinite(predictedRaw)) {
				throw new Error(
					`Prediction calculation produced non-finite value for month ${row.month_name}`
				);
			}

			return {
				month: row.month_name,
				predictedPrice: roundToTwo(Math.max(0, predictedRaw))
			};
		});

		return { predictions };
	} catch (error: unknown) {
		console.error(error);
		throw createError({
			statusCode: 500,
			statusMessage:
				error instanceof Error && error.message
					? error.message
					: 'Prediction service unavailable.'
		});
	}
});
