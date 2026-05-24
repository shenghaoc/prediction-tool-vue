<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { Home, Layers, MapPin, Moon, Sparkles, Sun } from '@lucide/vue';

import PredictionForm from '~/components/prediction/PredictionForm.vue';
import PredictionResults from '~/components/prediction/PredictionResults.vue';
import StatTile from '~/components/prediction/StatTile.vue';
import Badge from '~/components/ui/Badge.vue';
import Button from '~/components/ui/Button.vue';
import Card from '~/components/ui/Card.vue';
import CardContent from '~/components/ui/CardContent.vue';
import CardDescription from '~/components/ui/CardDescription.vue';
import CardHeader from '~/components/ui/CardHeader.vue';
import CardTitle from '~/components/ui/CardTitle.vue';
import Skeleton from '~/components/ui/Skeleton.vue';
import { cn } from '~/lib/utils';
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
const hasPrediction = computed(() => output.value > 0);
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

useHead(() => ({
title: tr('price_prediction').replace('\n', ' '),
htmlAttrs: {
lang: currentLang.value,
class: darkMode.value ? 'dark' : ''
}
}));

function tr(key: string) {
return translate(currentLang.value, key);
}

function clearErrors() {
for (const key of Object.keys(fieldErrors) as Array<keyof FieldType>) {
fieldErrors[key] = '';
}
}

function restoreFromStorage() {
if (!import.meta.client) {
return;
}

const isDark = localStorage.getItem('theme') === 'dark';
darkMode.value = isDark;

const savedLang = localStorage.getItem('lang');
if (savedLang === 'en' || savedLang === 'zh') {
currentLang.value = savedLang;
}

const savedForm = localStorage.getItem('form');
if (!savedForm) {
return;
}

try {
const parsed = JSON.parse(savedForm) as Partial<FieldType>;
form.value = {
...initialFormValues,
...parsed,
floor_area_sqm: Number(parsed.floor_area_sqm ?? initialFormValues.floor_area_sqm),
lease_commence_date: Number(
parsed.lease_commence_date ?? initialFormValues.lease_commence_date
)
};
} catch {
form.value = { ...initialFormValues };
localStorage.removeItem('form');
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
localStorage.setItem('lang', value);
}
});

watch(darkMode, (value) => {
if (isHydrated.value && import.meta.client) {
localStorage.setItem('theme', value ? 'dark' : 'light');
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
<main v-if="isHydrated" class="min-h-screen px-6 pb-12 pt-5 max-sm:px-3 max-sm:pb-8">
<div class="mx-auto max-w-7xl">
<header
class="animate-fade-in-deep sticky top-0 z-20 -mx-6 mb-6 flex items-center justify-between gap-4 border-b border-border/50 bg-background/85 px-6 py-4 backdrop-blur-md max-sm:relative max-sm:mx-0 max-sm:flex-col max-sm:items-start max-sm:px-0"
>
<div class="flex items-center gap-2.5">
<span class="font-heading text-base font-bold tracking-tight">{{ tr('brand') }}</span>
<Badge variant="secondary" class="gap-1">
<Sparkles class="size-3" aria-hidden />
{{ tr('badge') }}
</Badge>
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

<div class="grid grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] items-start gap-5 max-[860px]:grid-cols-1">
<div class="flex flex-col gap-5">
<Card
:class="cn('animate-fade-in-deep border-l-4 border-l-primary/70 py-6 relative overflow-hidden border-border/60 shadow-sm ring-1 ring-foreground/5')"
>
<div
class="pointer-events-none absolute -right-20 -top-16 size-56 rounded-full bg-primary/15 blur-3xl"
aria-hidden
/>
<div
class="pointer-events-none absolute -bottom-20 -left-16 size-48 rounded-full bg-chart-2/15 blur-3xl"
aria-hidden
/>
<CardHeader class="relative px-6 pb-0">
<CardTitle
:class="cn(
'font-heading whitespace-pre-line text-[clamp(2rem,5vw,3rem)] font-bold tracking-tight normal-case',
isZh && 'font-cjk font-extrabold'
)"
>
{{ tr('price_prediction') }}
</CardTitle>
<CardDescription class="max-w-prose text-base leading-relaxed">
{{ tr('intro_blurb') }}
</CardDescription>
</CardHeader>
<CardContent class="relative px-6 pt-4">
<div class="animate-stagger grid grid-cols-3 gap-2.5 max-sm:grid-cols-1">
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

<Card
:class="cn('animate-fade-in-deep border-l-4 border-l-primary/70 py-6 relative overflow-hidden border-border/60 shadow-sm ring-1 ring-foreground/5')"
>
<CardHeader class="px-6 pb-2">
<CardTitle class="text-primary normal-case">
{{ tr('prediction_form') }}
</CardTitle>
</CardHeader>
<CardContent class="px-6">
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

<div>
<PredictionResults
:output="output"
:has-prediction="hasPrediction"
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

<main v-else class="min-h-screen px-6 pb-12 pt-5" aria-busy="true">
<div class="mx-auto max-w-7xl space-y-5">
<Skeleton class="animate-shimmer h-10 w-full max-w-md rounded-xl" />
<div class="grid grid-cols-2 gap-5 max-[860px]:grid-cols-1">
<Skeleton class="animate-shimmer h-64 rounded-xl" />
<Skeleton class="animate-shimmer h-96 rounded-xl" />
</div>
</div>
</main>
</template>
