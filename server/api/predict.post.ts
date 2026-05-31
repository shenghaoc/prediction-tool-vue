import {
	formatApiValidationError,
	predictionFormSchema,
	toNormalizedRequest
} from '#shared/predictionSchema';
import { getPredictionDatabase, runPrediction } from '../utils/runPrediction';

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

	const parsed = predictionFormSchema.safeParse(requestBody);
	if (!parsed.success) {
		throw createError({
			statusCode: 400,
			statusMessage: formatApiValidationError(parsed.error)
		});
	}

	try {
		const db = getPredictionDatabase(event);
		return await runPrediction(db, toNormalizedRequest(parsed.data));
	} catch (error: unknown) {
		if (error instanceof Error && 'statusCode' in error) {
			throw error;
		}

		console.error(error);
		throw createError({
			statusCode: 500,
			statusMessage: 'Prediction service unavailable.'
		});
	}
});
