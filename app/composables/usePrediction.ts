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
		const data = error.data;

		if (data && typeof data === 'object') {
			const record = data as Record<string, unknown>;

			if (typeof record.statusMessage === 'string' && record.statusMessage.trim()) {
				return record.statusMessage;
			}
			if (typeof record.message === 'string' && record.message.trim()) {
				return record.message;
			}

			// Handle { error: "..." } and { error: { message: "..." } } shapes
			const errorField = record.error;
			if (typeof errorField === 'string' && errorField.trim()) {
				return errorField;
			}
			if (
				typeof errorField === 'object' &&
				errorField !== null &&
				typeof (errorField as Record<string, unknown>).message === 'string' &&
				((errorField as Record<string, unknown>).message as string).trim()
			) {
				return (errorField as Record<string, unknown>).message as string;
			}
		}

		// Raw string body (e.g., non-JSON error page)
		if (typeof data === 'string' && data.trim()) {
			return data;
		}

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
		errorMessage.value = '';
		loading.value = true;
		output.value = 0;
		trendData.value = defaultTrendData();
		summaryValues.value = summaryFrom(values);

		try {
			const floorAreaSqm = Math.max(20, Math.min(300, Math.round(values.floor_area_sqm)));

			const data = await $fetch<ApiResponse>('/api/prices', {
				method: 'POST',
				body: {
					mlModel: values.ml_model,
					town: values.town,
					storeyRange: values.storey_range,
					flatModel: values.flat_model,
					floorAreaSqm,
					leaseCommenceYear: values.lease_commence_date
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
			trendData.value = defaultTrendData();
			output.value = 0;
			errorMessage.value = extractErrorMessage(error, tr('error_fetch'));
		} finally {
			loading.value = false;
		}
	}

	return { output, trendData, loading, errorMessage, summaryValues, clearError, reset, predict };
}
