<script setup lang="ts">
import { computed } from 'vue';

import PriceTrendChart from '~/components/prediction/PriceTrendChart.vue';
import ResultsSkeleton from '~/components/prediction/ResultsSkeleton.vue';
import { formatCurrency } from '~/utils/format';
import type { SummaryValues, TrendPoint } from '~/utils/prediction';

const { t, locale } = useI18n();

const props = defineProps<{
	output: number;
	loading: boolean;
	summaryValues: SummaryValues;
	trendData: TrendPoint[];
	darkMode: boolean;
}>();

const hasOutput = computed(() => props.output > 0);
const showSkeleton = computed(() => props.loading && !hasOutput.value);

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
const normalizedLowValue = computed(() => (Number.isFinite(lowValue.value) ? lowValue.value : 0));
const deltaPositive = computed(() => deltaValue.value >= 0);

function optionLabel(
	group: 'ml_models' | 'towns' | 'storey_ranges' | 'flat_models',
	value: string
) {
	return t(`${group}.${value}`);
}

function formatPrice(value: number) {
	return formatCurrency(value, locale.value);
}

const summaryItems = computed(() => [
	{
		label: t('ml_model'),
		value: optionLabel('ml_models', props.summaryValues.ml_model),
		icon: 'i-heroicons-cube-transparent'
	},
	{
		label: t('town'),
		value: optionLabel('towns', props.summaryValues.town),
		icon: 'i-heroicons-map-pin'
	},
	{
		label: t('lease_commence_date'),
		value: String(props.summaryValues.lease_commence_date),
		icon: 'i-heroicons-calendar-days'
	}
]);

const kpis = computed(() => [
	{
		label: t('chart_latest'),
		value: formatPrice(latestValue.value)
	},
	{
		label: t('chart_range'),
		value: `${formatPrice(normalizedLowValue.value)} – ${formatPrice(peakValue.value)}`
	}
]);
</script>

<template>
	<UCard aria-labelledby="prediction-results-heading" :aria-busy="loading">
		<template #header>
			<div class="flex items-center gap-2">
				<UIcon name="i-heroicons-chart-bar" class="size-5 text-primary" />
				<h2 id="prediction-results-heading" class="text-base font-semibold text-highlighted">
					{{ t('predicted_price') }}
				</h2>
			</div>
		</template>

		<ResultsSkeleton v-if="showSkeleton" />

		<UEmpty
			v-else-if="!hasOutput"
			icon="i-heroicons-presentation-chart-line"
			:title="t('placeholder_title')"
			:description="t('placeholder_body')"
		/>

		<div v-else class="flex flex-col gap-6">
			<!-- Hero: the predicted price -->
			<div class="text-center">
				<p class="text-xs font-medium uppercase tracking-wide text-muted">
					{{ t('prediction') }}
				</p>
				<p
					:key="output"
					class="animate-settle mt-1 font-sans text-5xl font-bold tabular-nums tracking-tight text-primary"
				>
					{{ formatPrice(output) }}
				</p>
			</div>

			<USeparator />

			<!-- Scenario summary -->
			<div class="grid grid-cols-3 gap-3 max-sm:grid-cols-1">
				<UCard
					v-for="item in summaryItems"
					:key="item.label"
					variant="subtle"
					:ui="{ body: 'flex items-center gap-3 p-3 sm:p-3' }"
				>
					<UAvatar :icon="item.icon" color="primary" variant="soft" size="sm" />
					<div class="min-w-0">
						<p class="text-xs font-medium uppercase tracking-wide text-muted">
							{{ item.label }}
						</p>
						<p class="truncate text-sm font-semibold text-highlighted">{{ item.value }}</p>
					</div>
				</UCard>
			</div>

			<!-- Trend section -->
			<div>
				<div class="mb-3 flex items-baseline justify-between gap-3">
					<div>
						<h3 class="text-base font-semibold text-highlighted">
							{{ t('chart_story_title') }}
						</h3>
						<p class="text-sm text-muted">{{ t('predicted_trends') }}</p>
					</div>
					<UBadge
						:color="deltaPositive ? 'success' : 'warning'"
						variant="subtle"
						size="md"
						:icon="deltaPositive ? 'i-heroicons-arrow-trending-up' : 'i-heroicons-arrow-trending-down'"
					>
						{{ deltaPositive ? '+' : '−' }}{{ formatPrice(Math.abs(deltaValue)) }}
					</UBadge>
				</div>

				<div class="mb-4 grid grid-cols-2 gap-3 max-sm:grid-cols-1">
					<UCard
						v-for="kpi in kpis"
						:key="kpi.label"
						variant="subtle"
						:ui="{ body: 'p-3 sm:p-3' }"
					>
						<p class="text-xs font-medium uppercase tracking-wide text-muted">
							{{ kpi.label }}
						</p>
						<p class="mt-0.5 text-sm font-semibold tabular-nums text-highlighted">
							{{ kpi.value }}
						</p>
					</UCard>
				</div>

				<UCard variant="soft" :ui="{ body: 'p-2 sm:p-2' }">
					<ClientOnly>
						<PriceTrendChart :data="trendData" :dark-mode="darkMode" />
						<template #fallback>
							<USkeleton class="h-[240px] w-full" />
						</template>
					</ClientOnly>
				</UCard>

				<p class="mt-2 text-center text-xs text-muted">{{ t('vs_12m_ago') }}</p>
			</div>
		</div>
	</UCard>
</template>
