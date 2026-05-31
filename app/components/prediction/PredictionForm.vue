<script setup lang="ts">
import { computed } from 'vue';
import { Loader2 } from '@lucide/vue';

import type { PredictionFormHandle } from '~/composables/usePredictionForm';
import { FLAT_MODELS, ML_MODELS, STOREY_RANGES, TOWNS } from '~/utils/lists';
import { YEAR_OPTIONS, type FieldType } from '~/utils/prediction';
import { translatePredictionFieldError } from '~/utils/predictionValidation';
import Button from '~/components/ui/Button.vue';
import Input from '~/components/ui/Input.vue';
import FormSelect from '~/components/ui/FormSelect.vue';

const { t } = useI18n();

const props = defineProps<{
	form: PredictionFormHandle;
	loading: boolean;
	errorMessage: string;
}>();

const FormField = props.form.Field;

const emit = defineEmits<{
	reset: [];
}>();

function fieldError(field: keyof FieldType, errors: unknown[] | undefined) {
	return translatePredictionFieldError(field, errors, t);
}

function optionLabel(
	group: 'ml_models' | 'towns' | 'storey_ranges' | 'flat_models',
	value: string
) {
	return t(`${group}.${value}`);
}

const mlModelOptions = computed(() =>
	ML_MODELS.map((m) => ({ value: m, label: optionLabel('ml_models', m) }))
);
const townOptions = computed(() =>
	TOWNS.map((m) => ({ value: m, label: optionLabel('towns', m) }))
);
const storeyOptions = computed(() =>
	STOREY_RANGES.map((m) => ({ value: m, label: optionLabel('storey_ranges', m) }))
);
const flatModelOptions = computed(() =>
	FLAT_MODELS.map((m) => ({ value: m, label: optionLabel('flat_models', m) }))
);
const leaseYearOptions = computed(() =>
	YEAR_OPTIONS.map((y) => ({ value: String(y), label: String(y) }))
);
</script>

<template>
	<form class="flex flex-col gap-4" @submit.prevent="props.form.handleSubmit">
		<FormField v-slot="{ field }" name="ml_model">
			<FormSelect
				:label="t('ml_model')"
				label-for="input-ml_model"
				:error="fieldError('ml_model', field.state.meta.errors)"
				:model-value="field.state.value"
				:placeholder="t('select_ml_model')"
				:items="mlModelOptions"
				@update:model-value="field.handleChange"
			/>
		</FormField>

		<div class="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
			<FormField v-slot="{ field }" name="town">
				<FormSelect
					:label="t('town')"
					label-for="input-town"
					:error="fieldError('town', field.state.meta.errors)"
					:model-value="field.state.value"
					:placeholder="t('select_town')"
					:items="townOptions"
					@update:model-value="field.handleChange"
				/>
			</FormField>

			<FormField v-slot="{ field }" name="storey_range">
				<FormSelect
					:label="t('storey_range')"
					label-for="input-storey_range"
					:error="fieldError('storey_range', field.state.meta.errors)"
					:model-value="field.state.value"
					:placeholder="t('select_storey_range')"
					:items="storeyOptions"
					@update:model-value="field.handleChange"
				/>
			</FormField>

			<FormField v-slot="{ field }" name="flat_model">
				<FormSelect
					:label="t('flat_model')"
					label-for="input-flat_model"
					:error="fieldError('flat_model', field.state.meta.errors)"
					:model-value="field.state.value"
					:placeholder="t('select_flat_model')"
					:items="flatModelOptions"
					@update:model-value="field.handleChange"
				/>
			</FormField>

			<FormField v-slot="{ field }" name="floor_area_sqm">
				<div class="grid gap-1.5">
					<label
						for="input-floor_area"
						class="text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
					>
						{{ t('floor_area') }}
					</label>
					<div class="flex">
						<Input
							id="input-floor_area"
							type="number"
							inputmode="numeric"
							enterkeyhint="done"
							:min="20"
							:max="300"
							:step="1"
							:model-value="Number.isNaN(field.state.value) ? '' : String(field.state.value)"
							:placeholder="t('enter_floor_area')"
							:error="fieldError('floor_area_sqm', field.state.meta.errors)"
							class="relative rounded-r-none border-r-0 focus-visible:z-10"
							@input="
								field.handleChange(
									($event.target as HTMLInputElement).value === ''
										? Number.NaN
										: Number(($event.target as HTMLInputElement).value)
								)
							"
						/>
						<span
							class="inline-flex h-8 items-center rounded-r-sm border border-input bg-secondary px-3 text-xs font-semibold text-muted-foreground"
						>
							<span class="sr-only">{{ t('floor_area_unit') }}</span>
							<span aria-hidden>m²</span>
						</span>
					</div>
					<p
						v-if="fieldError('floor_area_sqm', field.state.meta.errors)"
						class="text-xs text-destructive"
					>
						{{ fieldError('floor_area_sqm', field.state.meta.errors) }}
					</p>
				</div>
			</FormField>
		</div>

		<FormField v-slot="{ field }" name="lease_commence_date">
			<FormSelect
				:label="t('lease_commence_date')"
				label-for="input-lease_commence_date"
				:error="fieldError('lease_commence_date', field.state.meta.errors)"
				:model-value="String(field.state.value as number)"
				:placeholder="t('select_year')"
				:items="leaseYearOptions"
				@update:model-value="field.handleChange(Number($event))"
			/>
		</FormField>

		<div class="grid grid-cols-2 gap-2.5 max-sm:grid-cols-1">
			<Button
				type="submit"
				size="default"
				class="w-full normal-case tracking-normal"
				:disabled="loading"
			>
				<Loader2 v-if="loading" class="size-4 animate-spin" aria-hidden />
				{{ loading ? t('predicting') : t('get_prediction') }}
			</Button>
			<Button
				type="button"
				variant="outline"
				size="default"
				class="w-full normal-case tracking-normal"
				@click="emit('reset')"
			>
				{{ t('reset_form') }}
			</Button>
		</div>

		<div
			v-if="loading"
			class="progress-track"
			role="progressbar"
			:aria-label="t('predicting')"
			aria-valuemin="0"
			aria-valuemax="100"
		>
			<div class="progress-bar" />
		</div>

		<div
			v-if="errorMessage && !loading"
			class="rounded-sm border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
			role="alert"
		>
			{{ errorMessage }}
		</div>
	</form>
</template>
