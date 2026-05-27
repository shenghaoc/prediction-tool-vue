<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
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
import { FLAT_MODELS, ML_MODELS, TOWNS } from '~/utils/lists';
import { translate, type Language } from '~/utils/i18n';
import {
defaultTrendData,
getPredictionTheme,
initialFormValues,
MAX_LEASE_COMMENCE_YEAR,
normalizePrice,
normalizeTrendData,
trendDataHasValidPrices,
type FieldType
} from '~/utils/prediction';

const form = ref<FieldType>({ ...initialFormValues });
const output = ref(0);
const trendData = ref(defaultTrendData());
const loading = ref(false);
const errorMessage = ref('');
const darkMode = ref(false);
const currentLang = ref<Language>('en');
const isHydrated = ref(false);
const skipNextPersist = ref(false);

const fieldErrors = reactive<Record<keyof FieldType, string>>({
ml_model: '',
town: '',
storey_range: '',
flat_model: '',
floor_area_sqm: '',
lease_commence_date: ''
});

const summaryValues = ref({
ml_model: form.value.ml_model,
town: form.value.town,
lease_commence_date: form.value.lease_commence_date
});

const theme = computed(() => getPredictionTheme(darkMode.value));
const isZh = computed(() => currentLang.value === 'zh');

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

function tr(key: string) {
return translate(currentLang.value, key);
}

useHead(() => ({
title: tr('price_prediction').replace('\n', ' '),
htmlAttrs: {
lang: currentLang.value,
class: darkMode.value ? 'dark' : ''
}
}));

function clearErrors() {
for (const key of Object.keys(fieldErrors) as Array<keyof FieldType>) {
fieldErrors[key] = '';
}
}

function restoreFromStorage() {
if (!import.meta.client) {
return;
}

try {
darkMode.value = localStorage.getItem('theme') === 'dark';
} catch {
/* storage unavailable */
}

try {
const savedLang = localStorage.getItem('lang');
if (savedLang === 'en' || savedLang === 'zh') {
currentLang.value = savedLang;
}
} catch {
/* storage unavailable */
}

try {
const savedForm = localStorage.getItem('form');
if (!savedForm) {
return;
}

const parsed = JSON.parse(savedForm);
if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
const data = parsed as Partial<FieldType>;
form.value = {
...initialFormValues,
...data,
floor_area_sqm: Number(data.floor_area_sqm ?? initialFormValues.floor_area_sqm),
lease_commence_date: Number(
	data.lease_commence_date ?? initialFormValues.lease_commence_date
)
};
} else {
throw new Error('Invalid stored form data');
}
} catch {
form.value = { ...initialFormValues };
try {
localStorage.removeItem('form');
} catch {
/* storage unavailable */
}
}
}

function validateForm() {
clearErrors();
const values = form.value;

if (!values.ml_model) {
fieldErrors.ml_model = tr('missing_ml_model');
}

if (!values.town) {
fieldErrors.town = tr('missing_town');
}

if (!values.storey_range) {
fieldErrors.storey_range = tr('missing_storey_range');
}

if (!values.flat_model) {
fieldErrors.flat_model = tr('missing_flat_model');
}

if (!Number.isFinite(values.floor_area_sqm)) {
fieldErrors.floor_area_sqm = tr('missing_floor_area');
} else if (values.floor_area_sqm < 20 || values.floor_area_sqm > 300) {
fieldErrors.floor_area_sqm = tr('floor_area_range');
}

if (!Number.isFinite(values.lease_commence_date)) {
fieldErrors.lease_commence_date = tr('missing_lease_commence_date');
} else if (
values.lease_commence_date < 1960 ||
values.lease_commence_date > MAX_LEASE_COMMENCE_YEAR
) {
fieldErrors.lease_commence_date = tr('missing_lease_commence_date');
}

return !Object.values(fieldErrors).some(Boolean);
}

function updateField(payload: { key: keyof FieldType; value: FieldType[keyof FieldType] }) {
form.value = {
...form.value,
[payload.key]:
payload.key === 'floor_area_sqm' || payload.key === 'lease_commence_date'
? Number(payload.value)
: payload.value
} as FieldType;

fieldErrors[payload.key] = '';
errorMessage.value = '';
}

function toggleTheme() {
darkMode.value = !darkMode.value;
}

function setLanguage(language: Language) {
currentLang.value = language;
}

function resetForm() {
skipNextPersist.value = true;
form.value = { ...initialFormValues };
trendData.value = defaultTrendData();
output.value = 0;
errorMessage.value = '';
clearErrors();
summaryValues.value = {
ml_model: form.value.ml_model,
town: form.value.town,
lease_commence_date: form.value.lease_commence_date
};

if (import.meta.client) {
try {
localStorage.removeItem('form');
} catch {
/* storage unavailable */
}
}
}

async function getApiErrorMessage(response: Response) {
const fallback = tr('error_fetch');
const body = await response.text();

if (!body) {
return fallback;
}

try {
const parsed = JSON.parse(body) as {
error?: string | { message?: string };
statusMessage?: string;
message?: string;
};

if (typeof parsed.statusMessage === 'string' && parsed.statusMessage.trim()) {
return parsed.statusMessage;
}

if (typeof parsed.message === 'string' && parsed.message.trim()) {
return parsed.message;
}

if (typeof parsed.error === 'string' && parsed.error.trim()) {
return parsed.error;
}

if (
typeof parsed.error === 'object' &&
parsed.error !== null &&
typeof parsed.error.message === 'string' &&
parsed.error.message.trim()
) {
return parsed.error.message;
}
} catch {
if (body.trim()) {
return body;
}
}

return fallback;
}

async function handleSubmit() {
errorMessage.value = '';

if (!validateForm()) {
return;
}

loading.value = true;
output.value = 0;
trendData.value = defaultTrendData();
summaryValues.value = {
ml_model: form.value.ml_model,
town: form.value.town,
lease_commence_date: form.value.lease_commence_date
};

try {
const floorArea = Math.max(20, Math.min(300, Math.round(form.value.floor_area_sqm)));

const response = await fetch('/api/prices', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({
mlModel: form.value.ml_model,
town: form.value.town,
storeyRange: form.value.storey_range,
flatModel: form.value.flat_model,
floorAreaSqm: floorArea,
leaseCommenceYear: form.value.lease_commence_date
})
});

if (!response.ok) {
throw new Error(await getApiErrorMessage(response));
}

const serverData = normalizeTrendData(await response.json());
if (!trendDataHasValidPrices(serverData)) {
throw new Error(tr('error_invalid_prediction'));
}
trendData.value = serverData;
output.value = normalizePrice(serverData[serverData.length - 1]?.value ?? 0);
} catch (error) {
trendData.value = defaultTrendData();
output.value = 0;
errorMessage.value =
error instanceof Error && error.message ? error.message : tr('error_fetch');
} finally {
loading.value = false;
}
}

watch(currentLang, (value) => {
if (isHydrated.value && import.meta.client) {
try {
	localStorage.setItem('lang', value);
} catch {
	/* storage unavailable */
}
}
});

watch(darkMode, (value) => {
if (isHydrated.value && import.meta.client) {
try {
	localStorage.setItem('theme', value ? 'dark' : 'light');
} catch {
	/* storage unavailable */
}
}
});

watch(form, (value) => {
if (!isHydrated.value || !import.meta.client) {
return;
}

if (skipNextPersist.value) {
skipNextPersist.value = false;
return;
}

try {
localStorage.setItem('form', JSON.stringify(value));
} catch {
/* storage unavailable */
}
});

onMounted(() => {
restoreFromStorage();
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
			{{ tr('brand') }}
		</span>
	</div>

	<div class="flex items-center gap-2 max-sm:w-full max-sm:[&>*]:flex-1">
		<Button
			type="button"
			variant="outline"
			size="sm"
			class="normal-case tracking-normal max-sm:flex-1"
			@click="setLanguage(currentLang === 'en' ? 'zh' : 'en')"
		>
			{{ tr('switch_language') }}
		</Button>
		<Button
			type="button"
			variant="outline"
			size="icon"
			:aria-label="darkMode ? tr('switch_to_light_mode') : tr('switch_to_dark_mode')"
			@click="toggleTheme"
		>
			<Sun v-if="darkMode" class="size-4" />
			<Moon v-else class="size-4" />
		</Button>
	</div>
</header>

<!-- Two-column layout — stacks at 860px -->
<div class="grid grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] items-start gap-4 max-[860px]:grid-cols-1">
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
					{{ tr('price_prediction') }}
				</CardTitle>
				<p class="mt-1.5 max-w-prose text-sm leading-relaxed text-secondary-foreground">
					{{ tr('intro_blurb') }}
				</p>
			</CardHeader>
			<CardContent class="px-5 pt-4">
				<div class="grid grid-cols-3 gap-2 max-sm:grid-cols-1">
					<StatTile
						v-for="figure in figures"
						:key="figure.label"
						:icon="figure.icon"
						:label="tr(figure.label)"
						:value="figure.value"
						:hint="tr(figure.hint)"
					/>
				</div>
			</CardContent>
		</Card>

		<!-- Form card -->
		<Card class="py-4">
			<CardHeader class="px-5 pb-2">
				<CardTitle class="text-sm text-primary normal-case">
					{{ tr('prediction_form') }}
				</CardTitle>
			</CardHeader>
			<CardContent class="px-5">
				<PredictionForm
					:form="form"
					:field-errors="fieldErrors"
					:loading="loading"
					:current-lang="currentLang"
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
			:current-lang="currentLang"
		/>
	</div>
</div>
</div>
</main>

<!-- Pre-hydration skeleton — plain, no animations to prevent flash -->
<main v-else class="min-h-screen px-6 pb-10 pt-4" aria-busy="true">
<div class="mx-auto max-w-7xl space-y-4">
	<Skeleton class="animate-shimmer h-9 w-full max-w-sm rounded-sm" />
	<div class="grid grid-cols-2 gap-4 max-[860px]:grid-cols-1">
		<Skeleton class="animate-shimmer h-56 rounded-sm" />
		<Skeleton class="animate-shimmer h-80 rounded-sm" />
	</div>
</div>
</main>
</template>
