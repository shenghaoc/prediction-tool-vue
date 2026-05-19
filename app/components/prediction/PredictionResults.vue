<script setup lang="ts">
import { computed } from 'vue';

import PriceTrendChart from '~/components/prediction/PriceTrendChart.vue';
import { formatCurrency } from '~/utils/format';
import { translate, type Language } from '~/utils/i18n';
import type { PredictionTheme, SummaryValues, TrendPoint } from '~/utils/prediction';

const props = defineProps<{
	output: number;
	loading: boolean;
	summaryValues: SummaryValues;
	trendData: TrendPoint[];
	theme: PredictionTheme;
	currentLang: Language;
}>();

const hasPrediction = computed(() => props.output > 0);

const latestValue = computed(() => props.trendData[props.trendData.length - 1]?.value ?? 0);
const firstValue = computed(() => props.trendData[0]?.value ?? 0);
const peakValue = computed(() => Math.max(...props.trendData.map((point) => point.value), 0));
const lowValue = computed(() =>
	props.trendData.reduce(
		(currentLowest, point) =>
			point.value > 0 ? Math.min(currentLowest, point.value) : currentLowest,
		Number.POSITIVE_INFINITY
	)
);
const deltaValue = computed(() => latestValue.value - firstValue.value);
const normalizedLowValue = computed(() =>
	Number.isFinite(lowValue.value) ? lowValue.value : 0
);

function tr(key: string) {
	return translate(props.currentLang, key);
}

function optionLabel(group: 'ml_models' | 'towns' | 'storey_ranges' | 'flat_models', value: string) {
	return translate(props.currentLang, `${group}.${value}`);
}

function formatPrice(value: number) {
	return `$${Math.round(value).toLocaleString()}`;
}
</script>

<template>
	<section>
		<div class="prediction-results-card">
			<div class="prediction-results-header">
				<div>
					<span class="prediction-results-label">{{ tr('predicted_trends') }}</span>
					<h2 class="prediction-results-title">{{ tr('predicted_price') }}</h2>
				</div>

				<div class="prediction-price-panel" :class="{ 'prediction-loading-pulse': loading }">
					<span class="prediction-results-label">{{ tr('prediction') }}</span>
					<strong
						:key="output"
						:class="[
							'prediction-price-value',
							hasPrediction ? 'has-value' : 'awaiting'
						]"
					>
						{{ hasPrediction ? formatCurrency(output) : tr('awaiting') }}
					</strong>
				</div>
			</div>

			<div class="prediction-metric-grid">
				<div class="prediction-metric-card">
					<span class="prediction-metric-label">{{ tr('ml_model') }}</span>
					<strong class="prediction-metric-value">
						{{ optionLabel('ml_models', summaryValues.ml_model) }}
					</strong>
				</div>
				<div class="prediction-metric-card">
					<span class="prediction-metric-label">{{ tr('town') }}</span>
					<strong class="prediction-metric-value">
						{{ optionLabel('towns', summaryValues.town) }}
					</strong>
				</div>
				<div class="prediction-metric-card">
					<span class="prediction-metric-label">{{ tr('lease_commence_date') }}</span>
					<strong class="prediction-metric-value">
						{{ summaryValues.lease_commence_date }}
					</strong>
				</div>
			</div>

			<div v-if="hasPrediction" class="prediction-chart-shell">
				<span class="prediction-chart-kicker">{{ tr('predicted_trends') }}</span>
				<h3 class="prediction-chart-title">{{ tr('chart_story_title') }}</h3>

				<div class="prediction-chart-summary-grid">
					<div class="prediction-chart-summary-card">
						<span>{{ tr('chart_latest') }}</span>
						<strong class="prediction-chart-summary-val">
							{{ formatPrice(latestValue) }}
						</strong>
					</div>
					<div class="prediction-chart-summary-card">
						<span>{{ tr('chart_range') }}</span>
						<strong class="prediction-chart-summary-val">
							{{ formatPrice(normalizedLowValue) }} – {{ formatPrice(peakValue) }}
						</strong>
					</div>
					<div class="prediction-chart-summary-card">
						<span>{{ tr('chart_delta') }}</span>
						<strong class="prediction-chart-summary-val">
							{{ deltaValue >= 0 ? '+' : '-' }}{{ formatPrice(Math.abs(deltaValue)) }}
						</strong>
						<span class="prediction-chart-summary-sub">{{ tr('vs_12m_ago') }}</span>
					</div>
				</div>

				<ClientOnly>
					<PriceTrendChart :data="trendData" :theme="theme" />
				</ClientOnly>
			</div>

			<div v-else class="prediction-placeholder">
				<h3 class="prediction-placeholder-title">{{ tr('placeholder_title') }}</h3>
				<p class="prediction-placeholder-body">{{ tr('placeholder_body') }}</p>
			</div>
		</div>
	</section>
</template>
