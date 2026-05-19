<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';

import PredictionForm from '~/components/prediction/PredictionForm.vue';
import PredictionResults from '~/components/prediction/PredictionResults.vue';
import { translate, type Language } from '~/utils/i18n';
import {
	defaultTrendData,
	getPredictionTheme,
	getPredictionWindow,
	initialFormValues,
	MAX_LEASE_COMMENCE_YEAR,
	normalizePrice,
	normalizeTrendData,
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

useHead(() => ({
	title: tr('price_prediction'),
	htmlAttrs: {
		lang: currentLang.value,
		'data-lang': currentLang.value,
		'data-theme': darkMode.value ? 'dark' : 'light'
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

	darkMode.value = localStorage.getItem('theme') === 'dark';

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
	}
}

function validateForm() {
	clearErrors();
	const values = form.value;

	if (!values.ml_model) {
		fieldErrors.ml_model = tr('choose_ml_model');
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
		localStorage.removeItem('form');
	}
}

async function getApiErrorMessage(response: Response) {
	const fallback = tr('error_fetch');
	const body = await response.text();

	if (!body) {
		return fallback;
	}

	try {
		const parsed = JSON.parse(body) as
			| { error?: string }
			| { error?: { message?: string } };

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
	summaryValues.value = {
		ml_model: form.value.ml_model,
		town: form.value.town,
		lease_commence_date: form.value.lease_commence_date
	};

	try {
		const { monthStart, monthEnd } = getPredictionWindow();
		const floorArea = Math.max(20, Math.min(300, Math.round(form.value.floor_area_sqm)));
		const formData = new FormData();

		formData.append('model', form.value.ml_model);
		formData.append('monthStart', monthStart);
		formData.append('monthEnd', monthEnd);
		formData.append('town', form.value.town);
		formData.append('storeyRange', form.value.storey_range);
		formData.append('flatModel', form.value.flat_model);
		formData.append('floorAreaSqm', String(floorArea));
		formData.append('leaseCommenceYear', String(form.value.lease_commence_date));

		const response = await fetch('https://ee4802-g20-tool.shenghaoc.workers.dev/api/prices', {
			method: 'POST',
			body: formData
		});

		if (!response.ok) {
			throw new Error(await getApiErrorMessage(response));
		}

		const serverData = normalizeTrendData(await response.json());
		trendData.value = serverData;
		output.value = normalizePrice(serverData[serverData.length - 1]?.value ?? 0);
	} catch (error) {
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

	localStorage.setItem('form', JSON.stringify(value));
});

onMounted(() => {
	restoreFromStorage();
	isHydrated.value = true;
});
</script>

<template>
	<main class="prediction-shell">
		<div class="prediction-surface">
			<div class="prediction-topbar">
				<div class="prediction-pill">{{ tr('intro_eyebrow') }}</div>

				<div class="prediction-actions">
					<button type="button" class="prediction-ghost-btn" @click="toggleTheme">
						{{ darkMode ? 'Light' : 'Dark' }}
					</button>
					<button
						type="button"
						class="prediction-ghost-btn"
						:class="{ 'is-active': currentLang === 'en' }"
						@click="setLanguage('en')"
					>
						EN
					</button>
					<button
						type="button"
						class="prediction-ghost-btn"
						:class="{ 'is-active': currentLang === 'zh' }"
						@click="setLanguage('zh')"
					>
						中文
					</button>
				</div>
			</div>

			<div class="prediction-layout">
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
	</main>
</template>
