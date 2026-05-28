import { ref } from 'vue';
import { FetchError } from 'ofetch';
import {
	defaultTrendData,
	initialFormValues,
	normalizePrice,
	normalizeTrendData,
	trendDataHasValidPrices,
	type ApiResponse,
	type FieldType,
	type SummaryValues,
	type TrendPoint
} from '~/utils/prediction';

function summaryFrom(values: SummaryValues): SummaryValues {
	return {
		ml_model: values.ml_model,
		town: values.town,
		lease_commence_date: values.lease_commence_date
	};
}

function extractErrorMessage(error: unknown, fallback: string): string {
	if (error instanceof FetchError) {
		// `error.data` is the parsed response body. For an H3/Nitro `createError`,
		// that body is `{ statusCode, statusMessage, message, data?, stack? }`, so
		// `data.statusMessage` is the server-authored message — prefer it, then
		// fall back to `data.message`.
		const data = error.data;

		if (data && typeof data === 'object') {
			const record = data as Record<string, unknown>;

			if (typeof record.statusMessage === 'string' && record.statusMessage.trim()) {
				return record.statusMessage;
			}
			if (typeof record.message === 'string' && record.message.trim()) {
				return record.message;
			}

			// Other backends nest the message under `error`: handle both
			// `{ error: "..." }` and `{ error: { message: "..." } }` shapes.
			const errorField = record.error;
			if (typeof errorField === 'string' && errorField.trim()) {
				return errorField;
			}
			if (typeof errorField === 'object' && errorField !== null) {
				const errObj = errorField as Record<string, unknown>;
				if (typeof errObj.message === 'string' && errObj.message.trim()) {
					return errObj.message;
				}
			}
		}

		// Raw string body (e.g., a non-JSON error page).
		if (typeof data === 'string' && data.trim()) {
			return data;
		}

		// Last resort: `error.statusMessage` here is the HTTP reason phrase
		// (status text on the FetchError itself), distinct from the body's
		// `data.statusMessage` handled above.
		if (typeof error.statusMessage === 'string' && error.statusMessage.trim()) {
			return error.statusMessage;
		}
	}

	if (error instanceof Error && error.message) {
		return error.message;
	}

	if (typeof error === 'string' && error.trim()) {
		return error;
	}

	return fallback;
}

export function usePrediction() {
	const output = ref(0);
	const trendData = ref<TrendPoint[]>(defaultTrendData());
	const loading = ref(false);
	const errorMessage = ref('');
	const summaryValues = ref<SummaryValues>(summaryFrom(initialFormValues));

	// Tracks the in-flight request so a rapid re-submit can supersede the
	// previous one — guards against out-of-order responses clobbering state.
	let activeController: AbortController | null = null;

	function clearError() {
		errorMessage.value = '';
	}

	function reset() {
		trendData.value = defaultTrendData();
		output.value = 0;
		errorMessage.value = '';
		summaryValues.value = summaryFrom(initialFormValues);
	}

	async function predict(values: FieldType, tr: (key: string) => string) {
		// Supersede any in-flight request so its response can't overwrite this one.
		activeController?.abort();
		const controller = new AbortController();
		activeController = controller;

		errorMessage.value = '';
		loading.value = true;
		output.value = 0;
		trendData.value = defaultTrendData();
		summaryValues.value = summaryFrom(values);

		try {
			// Numeric fields must be finite — `usePredictionForm.validate()` guarantees
			// this before predict() runs. Bail out loudly rather than silently
			// substituting defaults, which would produce a confident, wrong prediction.
			if (!Number.isFinite(values.floor_area_sqm) || !Number.isFinite(values.lease_commence_date)) {
				throw new Error(tr('error_invalid_input'));
			}

			const floorAreaSqm = Math.max(20, Math.min(300, Math.round(values.floor_area_sqm)));
			const leaseCommenceYear = values.lease_commence_date;

			const data = await $fetch<ApiResponse>('/api/prices', {
				method: 'POST',
				signal: controller.signal,
				body: {
					mlModel: values.ml_model,
					town: values.town,
					storeyRange: values.storey_range,
					flatModel: values.flat_model,
					floorAreaSqm,
					leaseCommenceYear
				}
			});

			if (!data || !Array.isArray(data.predictions)) {
				throw new Error(tr('error_invalid_prediction'));
			}

			const serverData = normalizeTrendData(data);
			if (!trendDataHasValidPrices(serverData)) {
				throw new Error(tr('error_invalid_prediction'));
			}

			trendData.value = serverData;
			output.value = normalizePrice(serverData[serverData.length - 1]?.value ?? 0);
		} catch (error) {
			// A newer submit aborted this request; let that newer call own the state.
			if (controller.signal.aborted) {
				return;
			}

			trendData.value = defaultTrendData();
			output.value = 0;
			errorMessage.value = extractErrorMessage(error, tr('error_fetch'));
		} finally {
			// Only the latest request clears the loading flag and releases the controller.
			if (activeController === controller) {
				loading.value = false;
				activeController = null;
			}
		}
	}

	return { output, trendData, loading, errorMessage, summaryValues, clearError, reset, predict };
}
