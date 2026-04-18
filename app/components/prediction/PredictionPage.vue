<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import en from 'element-plus/es/locale/lang/en';
import zhCn from 'element-plus/es/locale/lang/zh-cn';

import PredictionForm from '~/components/prediction/PredictionForm.vue';
import PredictionResults from '~/components/prediction/PredictionResults.vue';
import { translate, type Language } from '~/utils/i18n';
import {
	defaultTrendData,
	getPredictionTheme,
	getPredictionWindow,
	initialFormValues,
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
const isMobile = ref(false);
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

const theme = computed(() => getPredictionTheme(darkMode.value));
const summaryValues = computed(() => ({
	ml_model: form.value.ml_model,
	town: form.value.town,
	lease_commence_date: form.value.lease_commence_date
}));
const elementLocale = computed(() => (currentLang.value === 'zh' ? zhCn : en));

const pageStyle = computed<Record<string, string>>(() => ({
	'--page-bg': theme.value.pageBg,
	'--text-color': theme.value.text,
	'--text-muted': theme.value.textMuted,
	'--primary-color': theme.value.primary,
	'--accent-color': theme.value.accent,
	'--line-soft': theme.value.lineSoft,
	'--panel-bg': theme.value.panelBg,
	'--panel-strong': theme.value.panelStrong,
	'--results-bg': theme.value.resultsBg,
	'--results-bg-2': theme.value.resultsBg2,
	'--price-panel-bg': theme.value.pricePanelBg,
	'--field-bg': theme.value.fieldBg,
	'--pill-bg': theme.value.pillBg,
	'--focus-ring': theme.value.focusRing,
	'--panel-shadow': theme.value.shadow,
	'--accent-shadow': theme.value.accentShadow,
	'--mesh-line': theme.value.meshLine,
	'--orb-color': theme.value.orbColor,
	background: theme.value.background
}));

useHead(() => ({
	title: tr('price_prediction'),
	htmlAttrs: {
		lang: currentLang.value,
		'data-lang': currentLang.value
	},
	bodyAttrs: {
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

function setViewportFlags() {
	if (!import.meta.client) {
		return;
	}

	isMobile.value = window.innerWidth < 900;
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
	} else if (values.lease_commence_date < 1960 || values.lease_commence_date > 2022) {
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

	if (import.meta.client) {
		localStorage.removeItem('form');
	}
}

async function handleSubmit() {
	errorMessage.value = '';

	if (!validateForm()) {
		return;
	}

	loading.value = true;

	try {
		const { monthStart, monthEnd } = getPredictionWindow(form.value.lease_commence_date);
		const floorArea = Math.max(20, Math.min(300, Math.round(form.value.floor_area_sqm)));
		const formData = new FormData();

		formData.append('ml_model', form.value.ml_model);
		formData.append('month_start', monthStart);
		formData.append('month_end', monthEnd);
		formData.append('town', form.value.town);
		formData.append('storey_range', form.value.storey_range);
		formData.append('flat_model', form.value.flat_model);
		formData.append('floor_area_sqm', String(floorArea));
		formData.append('lease_commence_date', String(form.value.lease_commence_date));

		const response = await fetch('https://ee4802-g20-tool.shenghaoc.workers.dev/api/prices', {
			method: 'POST',
			body: formData
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(errorText || tr('error_fetch'));
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
	setViewportFlags();
	restoreFromStorage();
	isHydrated.value = true;

	if (import.meta.client) {
		window.addEventListener('resize', setViewportFlags);
	}
});

onBeforeUnmount(() => {
	if (import.meta.client) {
		window.removeEventListener('resize', setViewportFlags);
	}
});
</script>

<template>
	<el-config-provider :locale="elementLocale" size="large">
		<main class="prediction-shell" :style="pageStyle">
			<div class="prediction-surface">
				<div class="prediction-topbar">
					<el-tag class="prediction-pill" effect="plain" round>
						{{ tr('intro_eyebrow') }}
					</el-tag>

					<div class="prediction-actions">
						<el-button class="prediction-ghost-button" @click="toggleTheme">
							{{ darkMode ? 'Light' : 'Dark' }}
						</el-button>
						<el-button-group class="prediction-language-toggle">
							<el-button
								:type="currentLang === 'en' ? 'primary' : 'default'"
								@click="setLanguage('en')"
							>
								EN
							</el-button>
							<el-button
								:type="currentLang === 'zh' ? 'primary' : 'default'"
								@click="setLanguage('zh')"
							>
								中文
							</el-button>
						</el-button-group>
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
						:is-mobile="isMobile"
						:current-lang="currentLang"
					/>
				</div>
			</div>
		</main>
	</el-config-provider>
</template>
