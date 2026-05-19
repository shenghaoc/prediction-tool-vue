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
</script>

<template>
	<section>
		<div class="prediction-card">
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

				<div class="prediction-form-shell">
					<h2 class="prediction-section-title">{{ tr('prediction_form') }}</h2>

					<form @submit.prevent="emit('submit')">
						<div class="prediction-form-grid">
							<div>
								<label class="prediction-field-label" for="input-ml_model">
									{{ tr('ml_model') }}
								</label>
								<select
									id="input-ml_model"
									class="prediction-field-select"
									:value="form.ml_model"
									@change="
										updateField(
											'ml_model',
											($event.target as HTMLSelectElement).value as FieldType['ml_model']
										)
									"
								>
									<option v-for="mlModel in ML_MODELS" :key="mlModel" :value="mlModel">
										{{ optionLabel('ml_models', mlModel) }}
									</option>
								</select>
								<span v-if="fieldErrors.ml_model" class="prediction-field-error">
									{{ fieldErrors.ml_model }}
								</span>
							</div>

							<div>
								<label class="prediction-field-label" for="input-town">
									{{ tr('town') }}
								</label>
								<select
									id="input-town"
									class="prediction-field-select"
									:value="form.town"
									@change="
										updateField(
											'town',
											($event.target as HTMLSelectElement).value as FieldType['town']
										)
									"
								>
									<option v-for="town in TOWNS" :key="town" :value="town">
										{{ optionLabel('towns', town) }}
									</option>
								</select>
								<span v-if="fieldErrors.town" class="prediction-field-error">
									{{ fieldErrors.town }}
								</span>
							</div>

							<div>
								<label class="prediction-field-label" for="input-storey_range">
									{{ tr('storey_range') }}
								</label>
								<select
									id="input-storey_range"
									class="prediction-field-select"
									:value="form.storey_range"
									@change="
										updateField(
											'storey_range',
											($event.target as HTMLSelectElement)
												.value as FieldType['storey_range']
										)
									"
								>
									<option
										v-for="storeyRange in STOREY_RANGES"
										:key="storeyRange"
										:value="storeyRange"
									>
										{{ optionLabel('storey_ranges', storeyRange) }}
									</option>
								</select>
								<span v-if="fieldErrors.storey_range" class="prediction-field-error">
									{{ fieldErrors.storey_range }}
								</span>
							</div>

							<div>
								<label class="prediction-field-label" for="input-flat_model">
									{{ tr('flat_model') }}
								</label>
								<select
									id="input-flat_model"
									class="prediction-field-select"
									:value="form.flat_model"
									@change="
										updateField(
											'flat_model',
											($event.target as HTMLSelectElement)
												.value as FieldType['flat_model']
										)
									"
								>
									<option
										v-for="flatModel in FLAT_MODELS"
										:key="flatModel"
										:value="flatModel"
									>
										{{ optionLabel('flat_models', flatModel) }}
									</option>
								</select>
								<span v-if="fieldErrors.flat_model" class="prediction-field-error">
									{{ fieldErrors.flat_model }}
								</span>
							</div>

							<div class="prediction-field-full">
								<label class="prediction-field-label" for="input-floor_area">
									{{ tr('floor_area') }}
								</label>
								<div class="prediction-unit-wrap">
									<input
										id="input-floor_area"
										type="number"
										class="prediction-field-input"
										min="20"
										max="300"
										step="1"
										:value="form.floor_area_sqm"
										:placeholder="tr('enter_floor_area')"
										@input="
											updateField(
												'floor_area_sqm',
												Number(($event.target as HTMLInputElement).value)
											)
										"
									>
									<span class="prediction-unit-tag">m²</span>
								</div>
								<span v-if="fieldErrors.floor_area_sqm" class="prediction-field-error">
									{{ fieldErrors.floor_area_sqm }}
								</span>
							</div>

							<div class="prediction-field-full">
								<label class="prediction-field-label" for="input-lease_year">
									{{ tr('lease_commence_date') }}
								</label>
								<select
									id="input-lease_year"
									class="prediction-field-select"
									:value="form.lease_commence_date"
									@change="
										updateField(
											'lease_commence_date',
											Number(($event.target as HTMLSelectElement).value)
										)
									"
								>
									<option v-for="year in YEAR_OPTIONS" :key="year" :value="year">
										{{ year }}
									</option>
								</select>
								<span v-if="fieldErrors.lease_commence_date" class="prediction-field-error">
									{{ fieldErrors.lease_commence_date }}
								</span>
							</div>

							<div class="prediction-button-row">
								<button
									type="submit"
									class="prediction-btn-primary"
									:class="{ 'prediction-loading-pulse': loading }"
									:disabled="loading"
								>
									{{ loading ? tr('predicting') : tr('get_prediction') }}
								</button>
								<button
									type="button"
									class="prediction-btn-reset"
									:disabled="loading"
									@click="emit('reset')"
								>
									{{ tr('reset_form') }}
								</button>
							</div>
						</div>

						<p v-if="errorMessage" class="prediction-error-banner" role="alert">
							{{ errorMessage }}
						</p>
					</form>
				</div>
			</div>
		</div>
	</section>
</template>
