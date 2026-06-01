<script setup lang="ts">
import { computed } from 'vue';

import type { PredictionFormHandle } from '~/composables/usePredictionForm';
import { FLAT_MODELS, ML_MODELS, STOREY_RANGES, TOWNS } from '~/utils/lists';
import { YEAR_OPTIONS, type FieldType } from '~/utils/prediction';
import { translatePredictionFieldError } from '~/utils/predictionValidation';

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
			<UFormField
				:label="t('ml_model')"
				:error="fieldError('ml_model', field.state.meta.errors)"
				:ui="{ label: 'text-[11px] font-bold uppercase tracking-wider text-muted-foreground' }"
			>
				<USelect
					:model-value="field.state.value"
					:placeholder="t('select_ml_model')"
					:items="mlModelOptions"
					value-key="value"
					class="w-full"
					@update:model-value="field.handleChange"
				/>
			</UFormField>
		</FormField>

		<div class="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
			<FormField v-slot="{ field }" name="town">
				<UFormField
					:label="t('town')"
					:error="fieldError('town', field.state.meta.errors)"
					:ui="{ label: 'text-[11px] font-bold uppercase tracking-wider text-muted-foreground' }"
				>
					<USelect
						:model-value="field.state.value"
						:placeholder="t('select_town')"
						:items="townOptions"
						value-key="value"
						class="w-full"
						@update:model-value="field.handleChange"
					/>
				</UFormField>
			</FormField>

			<FormField v-slot="{ field }" name="storey_range">
				<UFormField
					:label="t('storey_range')"
					:error="fieldError('storey_range', field.state.meta.errors)"
					:ui="{ label: 'text-[11px] font-bold uppercase tracking-wider text-muted-foreground' }"
				>
					<USelect
						:model-value="field.state.value"
						:placeholder="t('select_storey_range')"
						:items="storeyOptions"
						value-key="value"
						class="w-full"
						@update:model-value="field.handleChange"
					/>
				</UFormField>
			</FormField>

			<FormField v-slot="{ field }" name="flat_model">
				<UFormField
					:label="t('flat_model')"
					:error="fieldError('flat_model', field.state.meta.errors)"
					:ui="{ label: 'text-[11px] font-bold uppercase tracking-wider text-muted-foreground' }"
				>
					<USelect
						:model-value="field.state.value"
						:placeholder="t('select_flat_model')"
						:items="flatModelOptions"
						value-key="value"
						class="w-full"
						@update:model-value="field.handleChange"
					/>
				</UFormField>
			</FormField>

			<FormField v-slot="{ field }" name="floor_area_sqm">
				<UFormField
					:label="t('floor_area')"
					:error="fieldError('floor_area_sqm', field.state.meta.errors)"
					:ui="{ label: 'text-[11px] font-bold uppercase tracking-wider text-muted-foreground' }"
				>
					<UInput
						type="number"
						inputmode="decimal"
						enterkeyhint="done"
						:min="20"
						:max="300"
						step="any"
						:model-value="field.state.value == null || Number.isNaN(field.state.value) ? '' : String(field.state.value)"
						:placeholder="t('enter_floor_area')"
						class="w-full"
						@update:model-value="
							field.handleChange(
								$event === '' ? Number.NaN : Number($event)
							)
						"
					>
						<template #trailing>
							<span class="text-xs font-semibold text-muted-foreground">
								<span class="sr-only">{{ t('floor_area_unit') }}</span>
								<span aria-hidden>m²</span>
							</span>
						</template>
					</UInput>
				</UFormField>
			</FormField>
		</div>

		<FormField v-slot="{ field }" name="lease_commence_date">
			<UFormField
				:label="t('lease_commence_date')"
				:error="fieldError('lease_commence_date', field.state.meta.errors)"
				:ui="{ label: 'text-[11px] font-bold uppercase tracking-wider text-muted-foreground' }"
			>
				<USelect
					:model-value="field.state.value == null || Number.isNaN(field.state.value) ? '' : String(field.state.value)"
					:placeholder="t('select_year')"
					:items="leaseYearOptions"
					value-key="value"
					class="w-full"
					@update:model-value="field.handleChange($event ? Number($event) : NaN)"
				/>
			</UFormField>
		</FormField>

		<div class="grid grid-cols-2 gap-2.5 max-sm:grid-cols-1">
			<UButton
				type="submit"
				size="md"
				block
				:loading="loading"
				class="normal-case tracking-normal"
				:disabled="loading"
			>
				{{ loading ? t('predicting') : t('get_prediction') }}
			</UButton>
			<UButton
				type="button"
				color="neutral"
				variant="outline"
				size="md"
				block
				class="normal-case tracking-normal"
				@click="emit('reset')"
			>
				{{ t('reset_form') }}
			</UButton>
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

		<UAlert
			v-if="errorMessage && !loading"
			color="error"
			variant="soft"
			:title="errorMessage"
		/>
	</form>
</template>
