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
		icon: 'i-heroicons-square-3-stack-3d',
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
		icon: 'i-heroicons-home',
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
	document.documentElement.classList.add('theme-ready');
});
</script>

<template>
	<main v-if="isHydrated" class="min-h-screen px-6 pb-10 pt-4 max-sm:px-3 max-sm:pb-6">
		<div class="mx-auto max-w-7xl">
			<header
				class="sticky top-0 z-20 -mx-6 mb-5 flex items-center justify-between gap-4 border-b border-default bg-default/90 px-6 py-3 backdrop-blur-sm max-sm:relative max-sm:mx-0 max-sm:flex-col max-sm:items-start max-sm:px-0"
			>
				<UBadge
					color="primary"
					variant="soft"
					size="sm"
					icon="i-heroicons-sparkles"
					class="font-bold uppercase tracking-wider"
				>
					{{ t('brand') }}
				</UBadge>

				<div class="flex items-center gap-2 max-sm:w-full max-sm:[&>*]:flex-1">
					<UButton
						type="button"
						color="neutral"
						variant="outline"
						size="sm"
						class="normal-case tracking-normal max-sm:flex-1"
						@click="setLanguage(locale === 'en' ? 'zh' : 'en')"
					>
						{{ t('switch_language') }}
					</UButton>
					<UTooltip :text="darkMode ? t('switch_to_light_mode') : t('switch_to_dark_mode')">
						<UColorModeButton
							color="neutral"
							variant="outline"
							size="sm"
							square
							:aria-label="darkMode ? t('switch_to_light_mode') : t('switch_to_dark_mode')"
						/>
					</UTooltip>
				</div>
			</header>

			<div
				class="grid grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] items-start gap-4 max-[860px]:grid-cols-1"
			>
				<div class="flex flex-col gap-4">
					<UCard :ui="{ header: 'px-5 pt-5 pb-0', body: 'px-5 pt-4 pb-5' }">
						<template #header>
							<h1
								:class="[
									'whitespace-pre-line text-[clamp(1.8rem,4vw,2.4rem)] font-extrabold tracking-tight normal-case leading-tight',
									isZh ? 'font-cjk' : 'font-sans'
								]"
							>
								{{ t('price_prediction') }}
							</h1>
							<p class="mt-1.5 max-w-prose text-sm leading-relaxed text-toned">
								{{ t('intro_blurb') }}
							</p>
						</template>
						<div class="grid grid-cols-3 gap-2 max-sm:grid-cols-1">
							<StatTile
								v-for="figure in figures"
								:key="figure.label"
								:icon="figure.icon"
								:label="t(figure.label)"
								:value="figure.value"
								:hint="t(figure.hint)"
							/>
						</div>
					</UCard>

					<UCard :ui="{ header: 'px-5 pt-4 pb-2', body: 'px-5 pb-4' }">
						<template #header>
							<h2 class="text-sm font-semibold text-primary normal-case">
								{{ t('prediction_form') }}
							</h2>
						</template>
						<PredictionForm
							:form="form"
							:loading="loading"
							:error-message="errorMessage"
							@reset="resetForm"
						/>
					</UCard>
				</div>

				<div>
					<PredictionResults
						:output="output"
						:loading="loading"
						:summary-values="summaryValues"
						:trend-data="trendData"
						:dark-mode="darkMode"
					/>
				</div>
			</div>
		</div>
	</main>

	<main v-else class="min-h-screen px-6 pb-10 pt-4" aria-busy="true">
		<div class="mx-auto max-w-7xl">
			<div
				class="sticky top-0 z-20 -mx-6 mb-5 flex items-center justify-between gap-4 border-b border-default bg-default/90 px-6 py-3 backdrop-blur-sm max-sm:relative max-sm:mx-0 max-sm:flex-col max-sm:items-start max-sm:px-0"
			>
				<USkeleton class="h-5 w-24 rounded-sm" />
				<div class="flex items-center gap-2">
					<USkeleton class="h-7 w-24 rounded-sm" />
					<USkeleton class="h-7 w-7 rounded-sm" />
				</div>
			</div>
			<div class="grid grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] gap-4 max-[860px]:grid-cols-1">
				<USkeleton class="h-56 rounded-sm" />
				<USkeleton class="h-80 rounded-sm" />
			</div>
		</div>
	</main>
</template>
