<script setup lang="ts">
import { computed } from 'vue';
import { Home, Layers, MapPin, TrendingDown, TrendingUp } from '@lucide/vue';

import PriceTrendChart from '~/components/prediction/PriceTrendChart.vue';
import ResultsSkeleton from '~/components/prediction/ResultsSkeleton.vue';
import Badge from '~/components/ui/Badge.vue';
import Separator from '~/components/ui/Separator.vue';
import Skeleton from '~/components/ui/Skeleton.vue';
import { cn } from '~/lib/utils';
import { formatCurrency } from '~/utils/format';
import { translate, type Language } from '~/utils/i18n';
import type { PredictionTheme, SummaryValues, TrendPoint } from '~/utils/prediction';

const props = defineProps<{
output: number;
hasPrediction: boolean;
loading: boolean;
summaryValues: SummaryValues;
trendData: TrendPoint[];
theme: PredictionTheme;
currentLang: Language;
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
const normalizedLowValue = computed(() =>
Number.isFinite(lowValue.value) ? lowValue.value : 0
);
const deltaPositive = computed(() => deltaValue.value >= 0);

function tr(key: string) {
return translate(props.currentLang, key);
}

function optionLabel(group: 'ml_models' | 'towns' | 'storey_ranges' | 'flat_models', value: string) {
return translate(props.currentLang, `${group}.${value}`);
}

function formatPrice(value: number) {
return formatCurrency(value);
}

const summaryItems = computed(() => [
{
label: tr('ml_model'),
value: optionLabel('ml_models', props.summaryValues.ml_model),
icon: Layers
},
{
label: tr('town'),
value: optionLabel('towns', props.summaryValues.town),
icon: MapPin
},
{
label: tr('lease_commence_date'),
value: String(props.summaryValues.lease_commence_date),
icon: Home
}
]);
</script>

<template>
<section aria-labelledby="prediction-results-heading" :aria-busy="loading">
<div
class="relative animate-fade-in-deep overflow-hidden rounded-xl border-l-4 border-l-primary/70 border-border/60 bg-card py-6 shadow-sm ring-1 ring-foreground/5 transition-all duration-300 hover:shadow-md hover:shadow-primary/5"
>
<div
class="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full bg-primary/10 blur-3xl"
aria-hidden
/>
<div class="relative flex flex-row items-start justify-between gap-4 px-6 pb-2 max-sm:flex-col">
<div>
<Badge variant="secondary" class="mb-2">
{{ tr('predicted_trends') }}
</Badge>
<h2 id="prediction-results-heading" class="font-heading text-2xl font-semibold tracking-tight normal-case">
{{ tr('predicted_price') }}
</h2>
</div>
<div
:class="
cn(
'relative min-w-[200px] overflow-hidden rounded-xl border px-5 py-4 max-sm:w-full transition-all duration-500',
hasOutput
? 'border-primary/25 bg-gradient-to-br from-primary/12 via-accent/60 to-card animate-glow'
: 'border-border/60 bg-gradient-to-br from-secondary/40 to-card',
'shadow-[inset_0_1px_0_0_color-mix(in_oklab,var(--primary-foreground)_12%,transparent)]'
)
"
>
<div
class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,color-mix(in_oklab,var(--primary)_18%,transparent),transparent_55%)]"
aria-hidden
/>
<p class="relative text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
{{ tr('prediction') }}
</p>
<Skeleton v-if="showSkeleton" class="animate-shimmer relative mt-2 h-9 w-36 rounded-lg" />
<p
v-else
:key="output"
:class="
cn(
'relative mt-1 font-heading text-3xl font-extrabold tabular-nums tracking-tight transition-all duration-500',
!hasOutput && 'text-base font-semibold text-muted-foreground',
hasOutput && 'text-primary animate-settle'
)
"
>
{{ hasOutput ? formatPrice(output) : tr('awaiting') }}
</p>
</div>
</div>

<div class="relative flex flex-col gap-5 px-6">
<ResultsSkeleton v-if="showSkeleton" />
<template v-else>
<div class="grid grid-cols-3 gap-2.5 max-sm:grid-cols-1">
<div
v-for="(item, i) in summaryItems"
:key="item.label"
class="animate-fade-in flex items-center gap-3 rounded-xl border border-border/60 bg-secondary/40 p-3 backdrop-blur-sm transition-all duration-300 hover:border-primary/20 hover:bg-secondary/60 hover:shadow-sm"
:style="{ animationDelay: `${i * 0.08}s`, animationFillMode: 'both' }"
>
<div
class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/15"
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

<template v-if="hasOutput">
<Separator />
<div class="animate-fade-in">
<p class="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
{{ tr('predicted_trends') }}
</p>
<h3 class="mb-3 font-heading text-sm font-semibold normal-case">
{{ tr('chart_story_title') }}
</h3>
<div class="mb-4 grid grid-cols-3 gap-2.5 max-sm:grid-cols-1">
<div class="rounded-xl border border-border/60 bg-secondary/40 px-3 py-2.5 backdrop-blur-sm transition-all duration-300 hover:border-primary/20 hover:shadow-sm">
<p class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{{ tr('chart_latest') }}</p>
<p class="mt-1 text-sm font-semibold tabular-nums text-foreground">{{ formatPrice(latestValue) }}</p>
</div>
<div class="rounded-xl border border-border/60 bg-secondary/40 px-3 py-2.5 backdrop-blur-sm transition-all duration-300 hover:border-primary/20 hover:shadow-sm">
<p class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{{ tr('chart_range') }}</p>
<p class="mt-1 text-sm font-semibold tabular-nums text-foreground">{{ formatPrice(normalizedLowValue) }} – {{ formatPrice(peakValue) }}</p>
</div>
<div class="rounded-xl border border-border/60 bg-secondary/40 px-3 py-2.5 backdrop-blur-sm transition-all duration-300 hover:border-primary/20 hover:shadow-sm">
<p class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{{ tr('chart_delta') }}</p>
<p
:class="
cn(
'mt-1 flex items-center gap-1 text-sm font-semibold tabular-nums',
deltaPositive && 'text-emerald-600 dark:text-emerald-400',
!deltaPositive && 'text-amber-700 dark:text-amber-400'
)
"
>
<TrendingUp v-if="deltaPositive" class="size-3.5 shrink-0" aria-hidden />
<TrendingDown v-else class="size-3.5 shrink-0" aria-hidden />
{{ deltaPositive ? '+' : '-' }}{{ formatPrice(Math.abs(deltaValue)) }}
</p>
<p class="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
{{ tr('vs_12m_ago') }}
</p>
</div>
</div>
<div class="relative min-h-[260px] overflow-hidden rounded-xl border border-border/40 bg-gradient-to-br from-secondary/20 to-secondary/5 p-2 transition-all duration-300">
<ClientOnly>
<PriceTrendChart :data="trendData" :theme="theme" />
<template #fallback>
<div class="animate-shimmer min-h-[260px] w-full rounded-xl bg-muted" />
</template>
</ClientOnly>
</div>
</div>
</template>

<div
v-else
class="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border/70 bg-gradient-to-b from-muted/30 to-transparent px-4 py-12 text-center"
>
<div class="empty-float flex items-end gap-1.5 opacity-40" aria-hidden>
<div
v-for="(h, i) in [0.35, 0.55, 0.85, 0.45, 0.7, 0.3]"
:key="i"
class="w-2.5 rounded-sm bg-primary"
:style="{ height: `${h * 48}px`, opacity: 1 - i * 0.08 }"
/>
</div>
<h3 class="animate-fade-in font-heading text-base font-semibold text-foreground">
{{ tr('placeholder_title') }}
</h3>
<p
class="animate-fade-in mx-auto max-w-[32ch] text-sm leading-relaxed text-muted-foreground"
style="animation-delay: 0.08s; animation-fill-mode: both"
>
{{ tr('placeholder_body') }}
</p>
</div>
</template>
</div>
</div>
</section>
</template>
