import { z } from 'zod';

import {
	FLAT_MODELS,
	ML_MODELS,
	STOREY_RANGES,
	TOWNS,
	type FlatModel,
	type MLModel,
	type StoreyRange,
	type Town
} from '~/utils/lists';
import { MAX_LEASE_COMMENCE_YEAR } from '~/utils/prediction';

const MIN_FLOOR_AREA_SQM = 20;
const MAX_FLOOR_AREA_SQM = 300;
const MIN_LEASE_COMMENCE_YEAR = 1960;

function enumSchema<const T extends readonly string[]>(values: T) {
	return z.enum(values as unknown as [T[number], ...T[number][]]);
}

export const predictionFormSchema = z.object({
	ml_model: enumSchema<typeof ML_MODELS>(ML_MODELS),
	town: enumSchema<typeof TOWNS>(TOWNS),
	storey_range: enumSchema<typeof STOREY_RANGES>(STOREY_RANGES),
	flat_model: enumSchema<typeof FLAT_MODELS>(FLAT_MODELS),
	floor_area_sqm: z
		.number({ invalid_type_error: 'invalid_floor_area' })
		.finite('invalid_floor_area')
		.int('invalid_floor_area')
		.min(MIN_FLOOR_AREA_SQM, 'floor_area_out_of_range')
		.max(MAX_FLOOR_AREA_SQM, 'floor_area_out_of_range'),
	lease_commence_date: z
		.number({ invalid_type_error: 'invalid_lease_commence_date' })
		.finite('invalid_lease_commence_date')
		.int('invalid_lease_commence_date')
		.min(MIN_LEASE_COMMENCE_YEAR, 'lease_commence_date_out_of_range')
		.max(MAX_LEASE_COMMENCE_YEAR, 'lease_commence_date_out_of_range')
});

export type PredictionFormInput = z.infer<typeof predictionFormSchema>;

export const predictionApiSchema = z.object({
	mlModel: enumSchema<typeof ML_MODELS>(ML_MODELS),
	town: enumSchema<typeof TOWNS>(TOWNS),
	storeyRange: enumSchema<typeof STOREY_RANGES>(STOREY_RANGES),
	flatModel: enumSchema<typeof FLAT_MODELS>(FLAT_MODELS),
	floorAreaSqm: z
		.number({ invalid_type_error: 'invalid_floor_area' })
		.finite('invalid_floor_area')
		.min(MIN_FLOOR_AREA_SQM, 'floor_area_out_of_range')
		.max(MAX_FLOOR_AREA_SQM, 'floor_area_out_of_range'),
	leaseCommenceYear: z
		.number({ invalid_type_error: 'invalid_lease_commence_date' })
		.finite('invalid_lease_commence_date')
		.int('invalid_lease_commence_date')
		.min(MIN_LEASE_COMMENCE_YEAR, 'lease_commence_date_out_of_range')
		.max(MAX_LEASE_COMMENCE_YEAR, 'lease_commence_date_out_of_range')
});

export type PredictionApiInput = z.infer<typeof predictionApiSchema>;

export type NormalizedPredictionRequest = {
	mlModel: MLModel;
	town: Town;
	storeyRange: StoreyRange;
	flatModel: FlatModel;
	floorAreaSqm: number;
	leaseCommenceYear: number;
};

export function toNormalizedRequest(input: PredictionFormInput): NormalizedPredictionRequest {
	return {
		mlModel: input.ml_model,
		town: input.town,
		storeyRange: input.storey_range,
		flatModel: input.flat_model,
		floorAreaSqm: Math.max(
			MIN_FLOOR_AREA_SQM,
			Math.min(MAX_FLOOR_AREA_SQM, Math.round(input.floor_area_sqm))
		),
		leaseCommenceYear: input.lease_commence_date
	};
}

export function apiToNormalizedRequest(input: PredictionApiInput): NormalizedPredictionRequest {
	return {
		mlModel: input.mlModel,
		town: input.town,
		storeyRange: input.storeyRange,
		flatModel: input.flatModel,
		floorAreaSqm: Math.max(
			MIN_FLOOR_AREA_SQM,
			Math.min(MAX_FLOOR_AREA_SQM, Math.round(input.floorAreaSqm))
		),
		leaseCommenceYear: input.leaseCommenceYear
	};
}

const API_FIELD_ERRORS: Record<string, string> = {
	invalid_type: 'Invalid request body.',
	invalid_floor_area: 'Invalid floor area.',
	floor_area_out_of_range: 'Invalid floor area.',
	invalid_lease_commence_date: `Lease commence year must be between ${MIN_LEASE_COMMENCE_YEAR} and ${MAX_LEASE_COMMENCE_YEAR}.`,
	lease_commence_date_out_of_range: `Lease commence year must be between ${MIN_LEASE_COMMENCE_YEAR} and ${MAX_LEASE_COMMENCE_YEAR}.`
};

const API_ENUM_FIELD_ERRORS: Partial<Record<keyof PredictionApiInput, string>> = {
	mlModel: 'Invalid ML model.',
	town: 'Invalid town.',
	storeyRange: 'Invalid storey range.',
	flatModel: 'Invalid flat model.'
};

export function formatApiValidationError(error: z.ZodError): string {
	const [issue] = error.issues;
	if (!issue) {
		return 'Invalid request body.';
	}

	const messageKey = typeof issue.message === 'string' ? issue.message : 'invalid_type';
	if (messageKey in API_FIELD_ERRORS) {
		return API_FIELD_ERRORS[messageKey]!;
	}

	const field = issue.path[0];
	if (typeof field === 'string' && field in API_ENUM_FIELD_ERRORS) {
		return API_ENUM_FIELD_ERRORS[field as keyof PredictionApiInput]!;
	}

	return 'Invalid request body.';
}
