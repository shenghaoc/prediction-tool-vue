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

function updateTextField<K extends keyof FieldType>(key: K, event: Event) {
	const target = event.target as HTMLSelectElement | HTMLInputElement;
	const nextValue = target.value;
	const value = ['floor_area_sqm', 'lease_commence_date'].includes(key)
		? Number(nextValue)
		: nextValue;

	emit('updateField', {
		key,
		value: value as FieldType[K]
	});
}
</script>

<template>
	<section class="prediction-card">
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

			<form class="prediction-form-shell" novalidate @submit.prevent="emit('submit')">
				<h2 class="prediction-section-title">{{ tr('prediction_form') }}</h2>

				<div class="prediction-form-grid">
					<div class="prediction-field">
						<label for="ml_model">{{ tr('ml_model') }}</label>
						<select
							id="ml_model"
							:value="form.ml_model"
							@change="updateTextField('ml_model', $event)"
						>
							<option v-for="mlModel in ML_MODELS" :key="mlModel" :value="mlModel">
								{{ optionLabel('ml_models', mlModel) }}
							</option>
						</select>
						<p v-if="fieldErrors.ml_model" class="prediction-error">
							{{ fieldErrors.ml_model }}
						</p>
					</div>

					<div class="prediction-field">
						<label for="town">{{ tr('town') }}</label>
						<select id="town" :value="form.town" @change="updateTextField('town', $event)">
							<option v-for="town in TOWNS" :key="town" :value="town">
								{{ optionLabel('towns', town) }}
							</option>
						</select>
						<p v-if="fieldErrors.town" class="prediction-error">{{ fieldErrors.town }}</p>
					</div>

					<div class="prediction-field">
						<label for="storey_range">{{ tr('storey_range') }}</label>
						<select
							id="storey_range"
							:value="form.storey_range"
							@change="updateTextField('storey_range', $event)"
						>
							<option v-for="storeyRange in STOREY_RANGES" :key="storeyRange" :value="storeyRange">
								{{ optionLabel('storey_ranges', storeyRange) }}
							</option>
						</select>
						<p v-if="fieldErrors.storey_range" class="prediction-error">
							{{ fieldErrors.storey_range }}
						</p>
					</div>

					<div class="prediction-field">
						<label for="flat_model">{{ tr('flat_model') }}</label>
						<select
							id="flat_model"
							:value="form.flat_model"
							@change="updateTextField('flat_model', $event)"
						>
							<option v-for="flatModel in FLAT_MODELS" :key="flatModel" :value="flatModel">
								{{ optionLabel('flat_models', flatModel) }}
							</option>
						</select>
						<p v-if="fieldErrors.flat_model" class="prediction-error">
							{{ fieldErrors.flat_model }}
						</p>
					</div>

					<div class="prediction-field prediction-field-full">
						<label for="floor_area_sqm">{{ tr('floor_area') }}</label>
						<div class="prediction-unit-wrap">
							<input
								id="floor_area_sqm"
								:value="form.floor_area_sqm"
								type="number"
								min="20"
								max="300"
								step="1"
								:placeholder="tr('enter_floor_area')"
								@input="updateTextField('floor_area_sqm', $event)"
							>
							<div class="prediction-unit-tag">m²</div>
						</div>
						<p v-if="fieldErrors.floor_area_sqm" class="prediction-error">
							{{ fieldErrors.floor_area_sqm }}
						</p>
					</div>

					<div class="prediction-field prediction-field-full">
						<label for="lease_commence_date">{{ tr('lease_commence_date') }}</label>
						<select
							id="lease_commence_date"
							:value="form.lease_commence_date"
							@change="updateTextField('lease_commence_date', $event)"
						>
							<option v-for="year in YEAR_OPTIONS" :key="year" :value="year">
								{{ year }}
							</option>
						</select>
						<p v-if="fieldErrors.lease_commence_date" class="prediction-error">
							{{ fieldErrors.lease_commence_date }}
						</p>
					</div>
				</div>

				<div class="prediction-button-row">
					<button class="prediction-primary-button" type="submit" :disabled="loading">
						{{ loading ? '...' : tr('get_prediction') }}
					</button>
					<button
						class="prediction-reset-button"
						type="button"
						:disabled="loading"
						@click="emit('reset')"
					>
						{{ tr('reset_form') }}
					</button>
				</div>

				<p v-if="errorMessage" class="prediction-error">{{ errorMessage }}</p>
			</form>
		</div>
	</section>
</template>
