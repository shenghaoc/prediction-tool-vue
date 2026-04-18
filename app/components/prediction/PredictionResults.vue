<script setup lang="ts">
import { computed } from 'vue';

import { formatCurrency } from '~/utils/format';
import { translate, type Language } from '~/utils/i18n';
import type { PredictionTheme, SummaryValues, TrendPoint } from '~/utils/prediction';

const props = defineProps<{
	output: number;
	loading: boolean;
	summaryValues: SummaryValues;
	trendData: TrendPoint[];
	theme: PredictionTheme;
	isMobile: boolean;
	currentLang: Language;
}>();

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
</script>

<template>
	<section class="prediction-results-card">
		<div class="prediction-results-header">
			<div>
				<span class="prediction-results-label">{{ tr('predicted_trends') }}</span>
				<h2 class="prediction-results-title">{{ tr('predicted_price') }}</h2>
			</div>

			<div :class="['prediction-price-panel', { 'prediction-pulse': loading }]">
				<span class="prediction-results-label">{{ tr('prediction') }}</span>
				<strong :key="output">{{ formatCurrency(output) }}</strong>
			</div>
		</div>

		<div class="prediction-results-grid">
			<div class="prediction-metric-card">
				<span>{{ tr('ml_model') }}</span>
				<strong>{{ optionLabel('ml_models', summaryValues.ml_model) }}</strong>
			</div>
			<div class="prediction-metric-card">
				<span>{{ tr('town') }}</span>
				<strong>{{ optionLabel('towns', summaryValues.town) }}</strong>
			</div>
			<div class="prediction-metric-card">
				<span>{{ tr('lease_commence_date') }}</span>
				<strong>{{ summaryValues.lease_commence_date }}</strong>
			</div>
		</div>

		<div class="prediction-chart-shell">
			<div class="prediction-chart-header">
				<div class="prediction-chart-copy">
					<span class="prediction-chart-kicker">{{ tr('predicted_trends') }}</span>
					<h3 class="prediction-chart-title">{{ tr('chart_story_title') }}</h3>
				</div>

				<div class="prediction-chart-summary-grid">
					<div class="prediction-chart-summary-card">
						<span>{{ tr('chart_latest') }}</span>
						<strong>{{ `$${latestValue.toLocaleString()}` }}</strong>
					</div>
					<div class="prediction-chart-summary-card">
						<span>{{ tr('chart_range') }}</span>
						<strong>
							{{ `$${normalizedLowValue.toLocaleString()} - $${peakValue.toLocaleString()}` }}
						</strong>
					</div>
					<div class="prediction-chart-summary-card">
						<span>{{ tr('chart_delta') }}</span>
						<strong>
							{{ `${deltaValue >= 0 ? '+' : '-'}$${Math.abs(deltaValue).toLocaleString()}` }}
						</strong>
						<small>{{ tr('vs_12m_ago') }}</small>
					</div>
				</div>
			</div>

			<PriceTrendChart :data="trendData" :theme="theme" :is-mobile="isMobile" />
		</div>
	</section>
</template>
