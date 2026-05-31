<script setup lang="ts">
import { computed } from 'vue';
import { Loader2 } from '@lucide/vue';
import { useField } from 'vee-validate';

import { FLAT_MODELS, ML_MODELS, STOREY_RANGES, TOWNS } from '~/utils/lists';
import { YEAR_OPTIONS } from '~/utils/prediction';
import { translatePredictionFieldError } from '~/utils/predictionValidation';
import Button from '~/components/ui/Button.vue';
import Input from '~/components/ui/Input.vue';
import FormSelect from '~/components/ui/FormSelect.vue';

const { t } = useI18n();

defineProps<{
	loading: boolean;
	errorMessage: string;
}>();

const emit = defineEmits<{
	submit: [];
	reset: [];
}>();

const { value: mlModel, errorMessage: mlModelError } = useField<string>('ml_model');
const { value: town, errorMessage: townError } = useField<string>('town');
const { value: storeyRange, errorMessage: storeyRangeError } = useField<string>('storey_range');
const { value: flatModel, errorMessage: flatModelError } = useField<string>('flat_model');
const { value: floorAreaSqm, errorMessage: floorAreaError } = useField<number>('floor_area_sqm');
const { value: leaseCommenceDate, errorMessage: leaseCommenceDateError } =
	useField<number>('lease_commence_date');

function fieldError(
	field:
		| 'ml_model'
		| 'town'
		| 'storey_range'
		| 'flat_model'
		| 'floor_area_sqm'
		| 'lease_commence_date',
	message: string | undefined
) {
	return translatePredictionFieldError(field, message, t);
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
	<form class="flex flex-col gap-4" @submit.prevent="emit('submit')">
		<FormSelect
			:label="t('ml_model')"
			label-for="input-ml_model"
			:error="fieldError('ml_model', mlModelError)"
			:model-value="mlModel"
			:placeholder="t('select_ml_model')"
			:items="mlModelOptions"
			@update:model-value="mlModel = $event"
		/>

		<div class="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
			<FormSelect
				:label="t('town')"
				label-for="input-town"
				:error="fieldError('town', townError)"
				:model-value="town"
				:placeholder="t('select_town')"
				:items="townOptions"
				@update:model-value="town = $event"
			/>
			<FormSelect
				:label="t('storey_range')"
				label-for="input-storey_range"
				:error="fieldError('storey_range', storeyRangeError)"
				:model-value="storeyRange"
				:placeholder="t('select_storey_range')"
				:items="storeyOptions"
				@update:model-value="storeyRange = $event"
			/>
			<FormSelect
				:label="t('flat_model')"
				label-for="input-flat_model"
				:error="fieldError('flat_model', flatModelError)"
				:model-value="flatModel"
				:placeholder="t('select_flat_model')"
				:items="flatModelOptions"
				@update:model-value="flatModel = $event"
			/>
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
						:model-value="Number.isNaN(floorAreaSqm) ? '' : String(floorAreaSqm)"
						:placeholder="t('enter_floor_area')"
						:error="fieldError('floor_area_sqm', floorAreaError)"
						class="relative rounded-r-none border-r-0 focus-visible:z-10"
						@input="
							floorAreaSqm =
								($event.target as HTMLInputElement).value === ''
									? Number.NaN
									: Number(($event.target as HTMLInputElement).value)
						"
					/>
					<span
						class="inline-flex h-8 items-center rounded-r-sm border border-input bg-secondary px-3 text-xs font-semibold text-muted-foreground"
					>
						<span class="sr-only">{{ t('floor_area_unit') }}</span>
						<span aria-hidden>m²</span>
					</span>
				</div>
				<p v-if="fieldError('floor_area_sqm', floorAreaError)" class="text-xs text-destructive">
					{{ fieldError('floor_area_sqm', floorAreaError) }}
				</p>
			</div>
		</div>

		<FormSelect
			:label="t('lease_commence_date')"
			label-for="input-lease_commence_date"
			:error="fieldError('lease_commence_date', leaseCommenceDateError)"
			:model-value="String(leaseCommenceDate)"
			:placeholder="t('select_year')"
			:items="leaseYearOptions"
			@update:model-value="leaseCommenceDate = Number($event)"
		/>

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
