<script setup lang="ts">
import { computed } from 'vue';
import { Loader2 } from '@lucide/vue';
import { FLAT_MODELS, ML_MODELS, STOREY_RANGES, TOWNS } from '~/utils/lists';
import { translate, type Language } from '~/utils/i18n';
import { YEAR_OPTIONS, type FieldType } from '~/utils/prediction';
import Button from '~/components/ui/Button.vue';
import Input from '~/components/ui/Input.vue';
import FormSelect from '~/components/ui/FormSelect.vue';

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
	emit('updateField', { key, value });
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
	<form class="flex flex-col gap-6" @submit.prevent="emit('submit')">
		<FormSelect
			:label="tr('ml_model')"
			label-for="input-ml_model"
			:error="fieldErrors.ml_model"
			:model-value="form.ml_model"
			:placeholder="tr('select_ml_model')"
			:items="mlModelOptions"
			@update:model-value="updateField('ml_model', $event as FieldType['ml_model'])"
		/>

		<div class="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
			<FormSelect
				:label="tr('town')"
				label-for="input-town"
				:error="fieldErrors.town"
				:model-value="form.town"
				:placeholder="tr('select_town')"
				:items="townOptions"
				@update:model-value="updateField('town', $event as FieldType['town'])"
			/>
			<FormSelect
				:label="tr('storey_range')"
				label-for="input-storey_range"
				:error="fieldErrors.storey_range"
				:model-value="form.storey_range"
				:placeholder="tr('select_storey_range')"
				:items="storeyOptions"
				@update:model-value="updateField('storey_range', $event as FieldType['storey_range'])"
			/>
			<FormSelect
				:label="tr('flat_model')"
				label-for="input-flat_model"
				:error="fieldErrors.flat_model"
				:model-value="form.flat_model"
				:placeholder="tr('select_flat_model')"
				:items="flatModelOptions"
				@update:model-value="updateField('flat_model', $event as FieldType['flat_model'])"
			/>
			<div class="grid gap-1.5">
				<label for="input-floor_area" class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
					{{ tr('floor_area') }}
				</label>
				<div class="flex rounded-lg shadow-sm transition-shadow duration-200 focus-within:shadow-md focus-within:shadow-primary/10">
					<Input
						id="input-floor_area"
						type="number"
						inputmode="numeric"
						enterkeyhint="done"
						:min="20"
						:max="300"
						:step="1"
						:model-value="String(form.floor_area_sqm)"
						:placeholder="tr('enter_floor_area')"
						class="h-10 rounded-r-none rounded-l-lg border border-border/60 bg-card px-3 shadow-none transition-colors duration-200 focus-visible:border-primary/40"
						@input="updateField('floor_area_sqm', Number(($event.target as HTMLInputElement).value))"
					/>
					<span
						class="inline-flex h-10 items-center rounded-r-lg border border-l-0 border-border/60 bg-muted px-3 text-xs font-semibold text-muted-foreground transition-colors duration-200"
					>
						<span class="sr-only">{{ tr('floor_area_unit') }}</span>
						<span aria-hidden>m²</span>
					</span>
				</div>
				<p v-if="fieldErrors.floor_area_sqm" class="text-xs text-destructive">
					{{ fieldErrors.floor_area_sqm }}
				</p>
			</div>
		</div>

		<FormSelect
			:label="tr('lease_commence_date')"
			label-for="input-lease_commence_date"
			:error="fieldErrors.lease_commence_date"
			:model-value="String(form.lease_commence_date)"
			:placeholder="tr('select_year')"
			:items="leaseYearOptions"
			@update:model-value="updateField('lease_commence_date', Number($event))"
		/>

		<div class="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
			<Button
				type="submit"
				size="lg"
				class="w-full normal-case tracking-normal shadow-md shadow-primary/20 transition-all duration-200 hover:shadow-lg hover:shadow-primary/25 hover:brightness-110"
				:disabled="loading"
			>
				<Loader2 v-if="loading" class="size-4 animate-spin" aria-hidden />
				{{ loading ? tr('predicting') : tr('get_prediction') }}
			</Button>
			<Button
				type="button"
				variant="outline"
				size="lg"
				class="w-full normal-case tracking-normal transition-all duration-200 hover:bg-muted/80"
				@click="emit('reset')"
			>
				{{ tr('reset_form') }}
			</Button>
		</div>

		<div
			v-if="loading"
			class="progress-track"
			role="progressbar"
			:aria-label="tr('predicting')"
		>
			<div class="progress-bar" style="width: 60%" />
		</div>

		<div
			v-if="errorMessage && !loading"
			class="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
			role="alert"
		>
			{{ errorMessage }}
		</div>
	</form>
</template>
