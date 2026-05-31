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
	const { t } = useI18n();

	const output = ref(0);
	const trendData = ref<TrendPoint[]>(defaultTrendData());
	const loading = ref(false);
	const errorMessage = ref('');
	const summaryValues = ref<SummaryValues>(summaryFrom(initialFormValues));

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

	async function predict(values: FieldType) {
		activeController?.abort();
		const controller = new AbortController();
		activeController = controller;

		errorMessage.value = '';
		loading.value = true;
		output.value = 0;
		trendData.value = defaultTrendData();
		summaryValues.value = summaryFrom(values);

		try {
			const data = await $fetch<ApiResponse>('/api/predict', {
				method: 'POST',
				signal: controller.signal,
				body: values
			});

			if (!data || !Array.isArray(data.predictions)) {
				throw new Error(t('error_invalid_prediction'));
			}

			const serverData = normalizeTrendData(data);
			if (!trendDataHasValidPrices(serverData)) {
				throw new Error(t('error_invalid_prediction'));
			}

			trendData.value = serverData;
			output.value = normalizePrice(serverData[serverData.length - 1]?.value ?? 0);
		} catch (error) {
			if (controller.signal.aborted) {
				return;
			}

			trendData.value = defaultTrendData();
			output.value = 0;
			errorMessage.value = extractErrorMessage(error, t('error_fetch'));
		} finally {
			if (activeController === controller) {
				loading.value = false;
				activeController = null;
			}
		}
	}

	return { output, trendData, loading, errorMessage, summaryValues, clearError, reset, predict };
}
