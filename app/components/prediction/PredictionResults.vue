<script setup lang="ts">
import { computed } from 'vue';
import { Home, Layers, MapPin, TrendingDown, TrendingUp } from '@lucide/vue';

import PriceTrendChart from '~/components/prediction/PriceTrendChart.vue';
import ResultsSkeleton from '~/components/prediction/ResultsSkeleton.vue';
import Separator from '~/components/ui/Separator.vue';
import Skeleton from '~/components/ui/Skeleton.vue';
import { cn } from '~/lib/utils';
import { formatCurrency } from '~/utils/format';
import type { PredictionTheme, SummaryValues, TrendPoint } from '~/utils/prediction';

const { t } = useI18n();

const props = defineProps<{
	output: number;
	loading: boolean;
	summaryValues: SummaryValues;
	trendData: TrendPoint[];
	theme: PredictionTheme;
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
	return formatCurrency(value);
}

const summaryItems = computed(() => [
	{
		label: t('ml_model'),
		value: optionLabel('ml_models', props.summaryValues.ml_model),
		icon: Layers
	},
	{
		label: t('town'),
		value: optionLabel('towns', props.summaryValues.town),
		icon: MapPin
	},
	{
		label: t('lease_commence_date'),
		value: String(props.summaryValues.lease_commence_date),
		icon: Home
	}
]);
</script>

<template>
	<section aria-labelledby="prediction-results-heading" :aria-busy="loading">
		<div class="rounded-lg border border-border bg-card">
			<!-- Header: title + price badge -->
			<div class="flex flex-row items-start justify-between gap-4 px-5 py-4 max-sm:flex-col">
				<div>
					<h2
						id="prediction-results-heading"
						class="font-sans text-xl font-extrabold tracking-tight normal-case"
					>
						{{ t('predicted_price') }}
					</h2>
				</div>

				<!-- Price badge -->
				<div
					:class="
						cn(
							'min-w-[180px] rounded-sm border px-4 py-3 transition-all duration-300 max-sm:w-full',
							hasOutput ? 'border-primary/25 bg-primary/5' : 'border-border bg-secondary/50'
						)
					"
				>
					<p class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
						{{ t('prediction') }}
					</p>
					<Skeleton v-if="showSkeleton" class="animate-shimmer mt-2 h-8 w-32 rounded-sm" />
					<p
						v-else
						:key="output"
						:class="
							cn(
								'mt-1 font-sans text-2xl font-extrabold tabular-nums tracking-tight transition-all duration-300',
								!hasOutput && 'text-sm font-semibold text-muted-foreground',
								hasOutput && 'text-primary animate-settle'
							)
						"
					>
						{{ hasOutput ? formatPrice(output) : t('awaiting') }}
					</p>
				</div>
			</div>

			<!-- Body -->
			<div class="flex flex-col gap-4 px-5 pb-5">
				<ResultsSkeleton v-if="showSkeleton" />
				<template v-else>
					<template v-if="hasOutput">
						<!-- Summary tiles -->
						<div class="grid grid-cols-3 gap-2 max-sm:grid-cols-1">
							<div
								v-for="item in summaryItems"
								:key="item.label"
								class="flex items-center gap-2.5 rounded-sm border border-border bg-secondary/40 px-3 py-2 transition-all duration-200 hover:border-primary/20"
							>
								<div
									class="flex size-7 shrink-0 items-center justify-center rounded-sm bg-primary/10 ring-1 ring-primary/15"
									aria-hidden
								>
									<component :is="item.icon" class="size-4 text-primary" />
								</div>
								<div class="min-w-0">
									<p class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
										{{ item.label }}
									</p>
									<p class="truncate text-sm font-semibold text-foreground">{{ item.value }}</p>
								</div>
							</div>
						</div>

						<Separator />

						<!-- Chart section -->
						<div>
							<p
								class="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
							>
								{{ t('predicted_trends') }}
							</p>
							<h3 class="mb-3 font-sans text-sm font-semibold normal-case">
								{{ t('chart_story_title') }}
							</h3>

							<!-- Stats row -->
							<div class="mb-3 grid grid-cols-3 gap-2 max-sm:grid-cols-1">
								<div
									class="rounded-sm border border-border bg-secondary/40 px-3 py-2 transition-all duration-200 hover:border-primary/20"
								>
									<p class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
										{{ t('chart_latest') }}
									</p>
									<p class="mt-0.5 text-sm font-semibold tabular-nums text-foreground">
										{{ formatPrice(latestValue) }}
									</p>
								</div>
								<div
									class="rounded-sm border border-border bg-secondary/40 px-3 py-2 transition-all duration-200 hover:border-primary/20"
								>
									<p class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
										{{ t('chart_range') }}
									</p>
									<p class="mt-0.5 text-sm font-semibold tabular-nums text-foreground">
										{{ formatPrice(normalizedLowValue) }} – {{ formatPrice(peakValue) }}
									</p>
								</div>
								<div
									class="rounded-sm border border-border bg-secondary/40 px-3 py-2 transition-all duration-200 hover:border-primary/20"
								>
									<p class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
										{{ t('chart_delta') }}
									</p>
									<p
										:class="
											cn(
												'mt-0.5 flex items-center gap-1 text-sm font-semibold tabular-nums',
												deltaPositive && 'text-emerald-600 dark:text-emerald-400',
												!deltaPositive && 'text-amber-700 dark:text-amber-400'
											)
										"
									>
										<TrendingUp v-if="deltaPositive" class="size-3.5 shrink-0" aria-hidden />
										<TrendingDown v-else class="size-3.5 shrink-0" aria-hidden />
										{{ deltaPositive ? '+' : '-' }}{{ formatPrice(Math.abs(deltaValue)) }}
									</p>
									<p
										class="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground"
									>
										{{ t('vs_12m_ago') }}
									</p>
								</div>
							</div>

							<!-- Chart -->
							<div
								class="min-h-[240px] overflow-hidden rounded-sm border border-border bg-secondary/20 p-2"
							>
								<ClientOnly>
									<PriceTrendChart :data="trendData" :theme="theme" />
									<template #fallback>
										<div class="animate-shimmer min-h-[240px] w-full rounded-sm bg-muted" />
									</template>
								</ClientOnly>
							</div>
						</div>
					</template>

					<!-- Empty state -->
					<div
						v-else
						class="flex flex-col items-center justify-center gap-3 rounded-sm border border-dashed border-border bg-secondary/20 px-4 py-12 text-center"
					>
						<div class="empty-float flex items-end gap-1 opacity-40" aria-hidden>
							<div
								v-for="(h, i) in [0.35, 0.55, 0.85, 0.45, 0.7, 0.3]"
								:key="i"
								class="w-2 rounded-sm bg-primary"
								:style="{ height: `${h * 40}px` }"
							/>
						</div>
						<h3 class="font-sans text-sm font-semibold text-foreground">
							{{ t('placeholder_title') }}
						</h3>
						<p class="mx-auto max-w-[32ch] text-sm leading-relaxed text-muted-foreground">
							{{ t('placeholder_body') }}
						</p>
					</div>
				</template>
			</div>
		</div>
	</section>
</template>
