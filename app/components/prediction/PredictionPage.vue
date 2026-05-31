<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Home, Layers, MapPin, Moon, Sparkles, Sun } from '@lucide/vue';

import PredictionForm from '~/components/prediction/PredictionForm.vue';
import PredictionResults from '~/components/prediction/PredictionResults.vue';
import StatTile from '~/components/prediction/StatTile.vue';
import Button from '~/components/ui/Button.vue';
import Card from '~/components/ui/Card.vue';
import CardContent from '~/components/ui/CardContent.vue';
import CardHeader from '~/components/ui/CardHeader.vue';
import CardTitle from '~/components/ui/CardTitle.vue';
import Skeleton from '~/components/ui/Skeleton.vue';
import Tooltip from '~/components/ui/Tooltip.vue';
import { FLAT_MODELS, ML_MODELS, TOWNS } from '~/utils/lists';
import { getPredictionTheme } from '~/utils/prediction';
import type { FieldUpdate } from '~/composables/usePredictionForm';

const { t, locale, setLocale } = useI18n();

const {
	form,
	fieldErrors,
	validate,
	updateField: applyFieldUpdate,
	reset: resetFields
} = usePredictionForm();
const {
	output,
	trendData,
	loading,
	errorMessage,
	summaryValues,
	clearError,
	reset: resetResults,
	predict
} = usePrediction();

// VueUse owns the `dark` class on <html> and persists the choice to localStorage.
const colorMode = useColorMode({
	storageKey: 'theme',
	initialValue: 'light',
	modes: { light: 'light', dark: 'dark' }
});

const isHydrated = ref(false);

const theme = computed(() => getPredictionTheme(colorMode.value === 'dark'));
const darkMode = computed(() => colorMode.value === 'dark');
const isZh = computed(() => locale.value === 'zh');

const figures = [
	{
		label: 'stat_models',
		value: ML_MODELS.length.toString().padStart(2, '0'),
		icon: Layers,
		hint: 'stat_models_hint'
	},
	{
		label: 'stat_towns',
		value: TOWNS.length.toString().padStart(2, '0'),
		icon: MapPin,
		hint: 'stat_towns_hint'
	},
	{
		label: 'stat_types',
		value: FLAT_MODELS.length.toString().padStart(2, '0'),
		icon: Home,
		hint: 'stat_types_hint'
	}
];

useHead(() => ({
	title: t('price_prediction').replace('\n', ' '),
	htmlAttrs: {
		lang: locale.value
	}
}));

function updateField(payload: FieldUpdate) {
	applyFieldUpdate(payload);
	clearError();
}

function toggleTheme() {
	colorMode.value = colorMode.value === 'dark' ? 'light' : 'dark';
}

function setLanguage(language: 'en' | 'zh') {
	setLocale(language);
}

function resetForm() {
	resetFields();
	resetResults();
}

async function handleSubmit() {
	if (!validate()) {
		return;
	}

	await predict(form.value);
}

onMounted(() => {
	isHydrated.value = true;
	document.documentElement.classList.add('theme-ready');
});
</script>

<template>
	<main v-if="isHydrated" class="min-h-screen px-6 pb-10 pt-4 max-sm:px-3 max-sm:pb-6">
		<div class="mx-auto max-w-7xl">
			<!-- Sticky header — blurred background, no flash -->
			<header
				class="sticky top-0 z-20 -mx-6 mb-5 flex items-center justify-between gap-4 border-b border-border bg-background/90 px-6 py-3 backdrop-blur-sm max-sm:relative max-sm:mx-0 max-sm:flex-col max-sm:items-start max-sm:px-0"
			>
				<div class="flex items-center gap-2">
					<span
						class="inline-flex items-center gap-1.5 rounded-sm border border-primary/20 bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-foreground"
					>
						<span class="size-2 rounded-full bg-primary" aria-hidden />
						<Sparkles class="size-3" aria-hidden />
						{{ t('brand') }}
					</span>
				</div>

				<div class="flex items-center gap-2 max-sm:w-full max-sm:[&>*]:flex-1">
					<Button
						type="button"
						variant="outline"
						size="sm"
						class="normal-case tracking-normal max-sm:flex-1"
						@click="setLanguage(locale === 'en' ? 'zh' : 'en')"
					>
						{{ t('switch_language') }}
					</Button>
					<Tooltip>
						<Button
							type="button"
							variant="outline"
							size="icon"
							:aria-label="darkMode ? t('switch_to_light_mode') : t('switch_to_dark_mode')"
							@click="toggleTheme"
						>
							<Sun v-if="darkMode" class="size-4" />
							<Moon v-else class="size-4" />
						</Button>
						<template #content>
							<p aria-hidden="true">{{ darkMode ? t('switch_to_light_mode') : t('switch_to_dark_mode') }}</p>
						</template>
					</Tooltip>
				</div>
			</header>

			<!-- Two-column layout — stacks at 860px -->
			<div
				class="grid grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] items-start gap-4 max-[860px]:grid-cols-1"
			>
				<!-- Left column: intro + form -->
				<div class="flex flex-col gap-4">
					<!-- Intro card -->
					<Card class="py-5">
						<CardHeader class="px-5 pb-0">
							<CardTitle
								:class="[
									'whitespace-pre-line text-[clamp(1.8rem,4vw,2.4rem)] font-extrabold tracking-tight normal-case leading-tight',
									isZh ? 'font-cjk' : 'font-sans'
								]"
							>
								{{ t('price_prediction') }}
							</CardTitle>
							<p class="mt-1.5 max-w-prose text-sm leading-relaxed text-secondary-foreground">
								{{ t('intro_blurb') }}
							</p>
						</CardHeader>
						<CardContent class="px-5 pt-4">
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
						</CardContent>
					</Card>

					<!-- Form card -->
					<Card class="py-4">
						<CardHeader class="px-5 pb-2">
							<CardTitle class="text-sm text-primary normal-case">
								{{ t('prediction_form') }}
							</CardTitle>
						</CardHeader>
						<CardContent class="px-5">
							<PredictionForm
								:form="form"
								:field-errors="fieldErrors"
								:loading="loading"
								:error-message="errorMessage"
								@submit="handleSubmit"
								@reset="resetForm"
								@update-field="updateField"
							/>
						</CardContent>
					</Card>
				</div>

				<!-- Right column: results -->
				<div>
					<PredictionResults
						:output="output"
						:loading="loading"
						:summary-values="summaryValues"
						:trend-data="trendData"
						:theme="theme"
					/>
				</div>
			</div>
		</div>
	</main>

	<!-- Pre-hydration skeleton — shimmer placeholders sized to the real layout to prevent flash/CLS -->
	<main v-else class="min-h-screen px-6 pb-10 pt-4" aria-busy="true">
		<div class="mx-auto max-w-7xl">
			<!-- Header skeleton — matches real header dimensions to prevent CLS -->
			<div
				class="sticky top-0 z-20 -mx-6 mb-5 flex items-center justify-between gap-4 border-b border-border bg-background/90 px-6 py-3 backdrop-blur-sm max-sm:relative max-sm:mx-0 max-sm:flex-col max-sm:items-start max-sm:px-0"
			>
				<Skeleton class="animate-shimmer h-5 w-24 rounded-sm" />
				<div class="flex items-center gap-2">
					<Skeleton class="animate-shimmer h-7 w-24 rounded-sm" />
					<Skeleton class="animate-shimmer h-7 w-7 rounded-sm" />
				</div>
			</div>
			<div class="grid grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] gap-4 max-[860px]:grid-cols-1">
				<Skeleton class="animate-shimmer h-56 rounded-sm" />
				<Skeleton class="animate-shimmer h-80 rounded-sm" />
			</div>
		</div>
	</main>
</template>
