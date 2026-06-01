<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import PredictionForm from '~/components/prediction/PredictionForm.vue';
import PredictionResults from '~/components/prediction/PredictionResults.vue';
import StatTile from '~/components/prediction/StatTile.vue';
import { FLAT_MODELS, ML_MODELS, TOWNS } from '~/utils/lists';

const { t, locale, setLocale } = useI18n();

const {
	output,
	trendData,
	loading,
	errorMessage,
	summaryValues,
	reset: resetResults,
	predict
} = usePrediction();

const { form, reset: resetFields } = usePredictionForm({
	onSubmit: (values) => predict(values)
});

const colorMode = useColorMode();
const isHydrated = ref(false);

const darkMode = computed(() => colorMode.value === 'dark');
const isZh = computed(() => locale.value === 'zh');

const figures = [
	{
		label: 'stat_models',
		value: ML_MODELS.length.toString().padStart(2, '0'),
		icon: 'i-heroicons-cube-transparent',
		hint: 'stat_models_hint'
	},
	{
		label: 'stat_towns',
		value: TOWNS.length.toString().padStart(2, '0'),
		icon: 'i-heroicons-map-pin',
		hint: 'stat_towns_hint'
	},
	{
		label: 'stat_types',
		value: FLAT_MODELS.length.toString().padStart(2, '0'),
		icon: 'i-heroicons-home-modern',
		hint: 'stat_types_hint'
	}
];

useHead(() => ({
	title: t('price_prediction').replace('\n', ' '),
	htmlAttrs: {
		lang: locale.value
	}
}));

function setLanguage(language: 'en' | 'zh') {
	setLocale(language);
}

function resetForm() {
	resetFields();
	resetResults();
}

onMounted(() => {
	isHydrated.value = true;
});
</script>

<template>
	<UContainer v-if="isHydrated" class="py-4 sm:py-6">
		<header
			class="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-default pb-4"
		>
			<UBadge
				color="primary"
				variant="subtle"
				size="lg"
				icon="i-heroicons-sparkles"
			>
				{{ t('brand') }}
			</UBadge>

			<div class="flex items-center gap-2">
				<UButton
					type="button"
					color="neutral"
					variant="outline"
					size="md"
					@click="setLanguage(locale === 'en' ? 'zh' : 'en')"
				>
					{{ t('switch_language') }}
				</UButton>
				<UTooltip :text="darkMode ? t('switch_to_light_mode') : t('switch_to_dark_mode')">
					<UColorModeButton color="neutral" variant="outline" size="md" />
				</UTooltip>
			</div>
		</header>

		<section class="mb-8 sm:mb-10">
			<h1
				:class="[
					'text-balance text-3xl font-bold tracking-tight text-highlighted sm:text-4xl lg:text-5xl',
					isZh ? 'font-cjk' : 'font-sans'
				]"
			>
				{{ t('price_prediction').replace('\n', ' ') }}
			</h1>
			<p class="mt-3 max-w-2xl text-pretty text-sm text-muted sm:text-base">
				{{ t('intro_blurb') }}
			</p>

			<div class="mt-5 grid grid-cols-1 gap-3 sm:mt-6 sm:grid-cols-3">
				<StatTile
					v-for="figure in figures"
					:key="figure.label"
					:icon="figure.icon"
					:label="t(figure.label)"
					:value="figure.value"
					:hint="t(figure.hint)"
				/>
			</div>
		</section>

		<div
			class="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]"
		>
			<UCard>
				<template #header>
					<div class="flex items-center gap-2">
						<UIcon name="i-heroicons-adjustments-horizontal" class="size-5 text-primary" />
						<h2 class="text-base font-semibold text-highlighted">
							{{ t('prediction_form') }}
						</h2>
					</div>
				</template>

				<PredictionForm
					:form="form"
					:loading="loading"
					:error-message="errorMessage"
					@reset="resetForm"
				/>
			</UCard>

			<PredictionResults
				:output="output"
				:loading="loading"
				:summary-values="summaryValues"
				:trend-data="trendData"
				:dark-mode="darkMode"
			/>
		</div>
	</UContainer>

	<UContainer v-else class="py-6" aria-busy="true">
		<div class="mb-8 flex items-center justify-between gap-3 border-b border-default pb-4">
			<USkeleton class="h-7 w-32" />
			<div class="flex gap-2">
				<USkeleton class="h-9 w-24" />
				<USkeleton class="h-9 w-9" />
			</div>
		</div>
		<USkeleton class="mb-3 h-10 w-2/3" />
		<USkeleton class="mb-6 h-4 w-1/2" />
		<div class="mb-10 grid grid-cols-3 gap-3 max-sm:grid-cols-1">
			<USkeleton class="h-20" />
			<USkeleton class="h-20" />
			<USkeleton class="h-20" />
		</div>
		<div class="grid grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] gap-6 max-[860px]:grid-cols-1">
			<USkeleton class="h-96" />
			<USkeleton class="h-96" />
		</div>
	</UContainer>
</template>
