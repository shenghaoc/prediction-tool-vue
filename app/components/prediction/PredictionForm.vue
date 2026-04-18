<script setup lang="ts">
import { FLAT_MODELS, ML_MODELS, STOREY_RANGES, TOWNS } from '~/utils/lists';
import { translate, type Language } from '~/utils/i18n';
import { YEAR_OPTIONS, type FieldType } from '~/utils/prediction';

const props = defineProps<{
	form: FieldType;
	fieldErrors: Record<keyof FieldType, string>;
	loading: boolean;
	currentLang: Language;
	errorMessage: string;
}>();

const emit = defineEmits<{
	submit: [];
	reset: [];
	updateField: [payload: { key: keyof FieldType; value: FieldType[keyof FieldType] }];
}>();

function tr(key: string) {
	return translate(props.currentLang, key);
}

function optionLabel(group: 'ml_models' | 'towns' | 'storey_ranges' | 'flat_models', value: string) {
	return translate(props.currentLang, `${group}.${value}`);
}

function updateField<K extends keyof FieldType>(key: K, value: FieldType[K]) {
	emit('updateField', {
		key,
		value
	});
}

function updateNumberField<K extends 'floor_area_sqm' | 'lease_commence_date'>(
	key: K,
	value: number | null | undefined
) {
	updateField(key, Number(value ?? 0) as FieldType[K]);
}
</script>

<template>
	<el-card class="prediction-card prediction-form-card" shadow="never">
		<div class="prediction-card-inner">
			<div class="prediction-intro-block">
				<h1
					:class="[
						'prediction-headline',
						currentLang === 'zh' ? 'prediction-headline-cjk' : ''
					]"
				>
					{{ tr('price_prediction') }}
				</h1>
				<p class="prediction-lead">{{ tr('intro_blurb') }}</p>

				<div class="prediction-figure-row">
					<div class="prediction-figure">
						<span class="prediction-figure-label">{{ tr('ml_model') }}</span>
						<strong class="prediction-figure-value">
							{{ String(ML_MODELS.length).padStart(2, '0') }}
						</strong>
					</div>
					<div class="prediction-figure">
						<span class="prediction-figure-label">{{ tr('town') }}</span>
						<strong class="prediction-figure-value">
							{{ String(TOWNS.length).padStart(2, '0') }}
						</strong>
					</div>
					<div class="prediction-figure">
						<span class="prediction-figure-label">{{ tr('flat_model') }}</span>
						<strong class="prediction-figure-value">
							{{ String(FLAT_MODELS.length).padStart(2, '0') }}
						</strong>
					</div>
				</div>

				<p class="prediction-caption">{{ tr('intro_caption') }}</p>
			</div>

			<el-form class="prediction-form-shell" label-position="top" @submit.prevent="emit('submit')">
				<h2 class="prediction-section-title">{{ tr('prediction_form') }}</h2>

				<div class="prediction-form-grid">
					<el-form-item
						class="prediction-field"
						:label="tr('ml_model')"
						:error="fieldErrors.ml_model"
					>
						<el-select
							:model-value="form.ml_model"
							@update:model-value="updateField('ml_model', $event)"
						>
							<el-option
								v-for="mlModel in ML_MODELS"
								:key="mlModel"
								:label="optionLabel('ml_models', mlModel)"
								:value="mlModel"
							/>
						</el-select>
					</el-form-item>

					<el-form-item class="prediction-field" :label="tr('town')" :error="fieldErrors.town">
						<el-select
							:model-value="form.town"
							@update:model-value="updateField('town', $event)"
						>
							<el-option
								v-for="town in TOWNS"
								:key="town"
								:label="optionLabel('towns', town)"
								:value="town"
							/>
						</el-select>
					</el-form-item>

					<el-form-item
						class="prediction-field"
						:label="tr('storey_range')"
						:error="fieldErrors.storey_range"
					>
						<el-select
							:model-value="form.storey_range"
							@update:model-value="updateField('storey_range', $event)"
						>
							<el-option
								v-for="storeyRange in STOREY_RANGES"
								:key="storeyRange"
								:label="optionLabel('storey_ranges', storeyRange)"
								:value="storeyRange"
							/>
						</el-select>
					</el-form-item>

					<el-form-item
						class="prediction-field"
						:label="tr('flat_model')"
						:error="fieldErrors.flat_model"
					>
						<el-select
							:model-value="form.flat_model"
							@update:model-value="updateField('flat_model', $event)"
						>
							<el-option
								v-for="flatModel in FLAT_MODELS"
								:key="flatModel"
								:label="optionLabel('flat_models', flatModel)"
								:value="flatModel"
							/>
						</el-select>
					</el-form-item>

					<el-form-item
						class="prediction-field prediction-field-full"
						:label="tr('floor_area')"
						:error="fieldErrors.floor_area_sqm"
					>
						<div class="prediction-unit-wrap">
							<el-input-number
								:model-value="form.floor_area_sqm"
								:min="20"
								:max="300"
								:step="1"
								:precision="0"
								:controls="false"
								@update:model-value="updateNumberField('floor_area_sqm', $event)"
							/>
							<div class="prediction-unit-tag">m²</div>
						</div>
					</el-form-item>

					<el-form-item
						class="prediction-field prediction-field-full"
						:label="tr('lease_commence_date')"
						:error="fieldErrors.lease_commence_date"
					>
						<el-select
							:model-value="form.lease_commence_date"
							@update:model-value="updateNumberField('lease_commence_date', $event)"
						>
							<el-option
								v-for="year in YEAR_OPTIONS"
								:key="year"
								:label="String(year)"
								:value="year"
							/>
						</el-select>
					</el-form-item>
				</div>

				<div class="prediction-button-row">
					<el-button
						class="prediction-primary-button"
						type="primary"
						native-type="submit"
						:loading="loading"
					>
						{{ tr('get_prediction') }}
					</el-button>
					<el-button
						class="prediction-reset-button"
						:disabled="loading"
						@click="emit('reset')"
					>
						{{ tr('reset_form') }}
					</el-button>
				</div>

				<el-alert
					v-if="errorMessage"
					class="prediction-error-alert"
					:title="errorMessage"
					type="error"
					:closable="false"
					show-icon
				/>
			</el-form>
		</div>
	</el-card>
</template>
