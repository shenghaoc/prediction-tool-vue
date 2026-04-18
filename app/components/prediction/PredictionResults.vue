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
	<el-card class="prediction-results-card" shadow="never">
		<div class="prediction-results-header">
			<div>
				<span class="prediction-results-label">{{ tr('predicted_trends') }}</span>
				<h2 class="prediction-results-title">{{ tr('predicted_price') }}</h2>
			</div>

			<el-card :class="['prediction-price-panel', { 'prediction-pulse': loading }]" shadow="never">
				<el-statistic :value="output" :formatter="() => formatCurrency(output)">
					<template #title>
						<span class="prediction-results-label">{{ tr('prediction') }}</span>
					</template>
				</el-statistic>
			</el-card>
		</div>

		<el-descriptions
			class="prediction-results-grid"
			:column="isMobile ? 1 : 3"
			border
			direction="vertical"
		>
			<el-descriptions-item :label="tr('ml_model')">
				{{ optionLabel('ml_models', summaryValues.ml_model) }}
			</el-descriptions-item>
			<el-descriptions-item :label="tr('town')">
				{{ optionLabel('towns', summaryValues.town) }}
			</el-descriptions-item>
			<el-descriptions-item :label="tr('lease_commence_date')">
				{{ summaryValues.lease_commence_date }}
			</el-descriptions-item>
		</el-descriptions>

		<el-divider />

		<div class="prediction-chart-shell">
			<div class="prediction-chart-header">
				<div class="prediction-chart-copy">
					<span class="prediction-chart-kicker">{{ tr('predicted_trends') }}</span>
					<h3 class="prediction-chart-title">{{ tr('chart_story_title') }}</h3>
				</div>

				<div class="prediction-chart-summary-grid">
					<el-card class="prediction-chart-summary-card" shadow="never">
						<span>{{ tr('chart_latest') }}</span>
						<strong>{{ `$${latestValue.toLocaleString()}` }}</strong>
					</el-card>
					<el-card class="prediction-chart-summary-card" shadow="never">
						<span>{{ tr('chart_range') }}</span>
						<strong>
							{{ `$${normalizedLowValue.toLocaleString()} - $${peakValue.toLocaleString()}` }}
						</strong>
					</el-card>
					<el-card class="prediction-chart-summary-card" shadow="never">
						<span>{{ tr('chart_delta') }}</span>
						<strong>
							{{ `${deltaValue >= 0 ? '+' : '-'}$${Math.abs(deltaValue).toLocaleString()}` }}
						</strong>
						<small>{{ tr('vs_12m_ago') }}</small>
					</el-card>
				</div>
			</div>

			<ClientOnly fallback-tag="div">
				<PriceTrendChart :data="trendData" :theme="theme" :is-mobile="isMobile" />
			</ClientOnly>
		</div>
	</el-card>
</template>
