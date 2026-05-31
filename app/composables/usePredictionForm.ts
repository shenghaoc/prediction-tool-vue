import { computed, onMounted, watch } from 'vue';
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';

import { predictionFormSchema } from '#shared/predictionSchema';
import { translatePredictionFieldError } from '~/utils/predictionValidation';
import { initialFormValues, type FieldType } from '~/utils/prediction';

export type FieldUpdate = {
	[K in keyof FieldType]: { key: K; value: FieldType[K] };
}[keyof FieldType];

export function usePredictionForm() {
	const { t } = useI18n();

	const formState = useState<FieldType>('prediction-form', () => ({ ...initialFormValues }));
	const storedForm = useLocalStorage<FieldType>('form', { ...initialFormValues }, {
		mergeDefaults: true
	});

	const {
		errors,
		values,
		setFieldValue,
		resetForm: resetVeeForm,
		setValues,
		validate: validateForm
	} = useForm({
		validationSchema: toTypedSchema(predictionFormSchema),
		initialValues: formState.value
	});

	onMounted(() => {
		const merged = { ...initialFormValues, ...storedForm.value };
		formState.value = merged;
		setValues(merged);
	});

	watch(
		values,
		(next) => {
			const snapshot = { ...next } as FieldType;
			formState.value = snapshot;
			storedForm.value = snapshot;
		},
		{ deep: true }
	);

	const form = computed(() => values as FieldType);

	const fieldErrors = computed(() => {
		const resolved = {} as Record<keyof FieldType, string>;
		for (const key of Object.keys(initialFormValues) as Array<keyof FieldType>) {
			resolved[key] = translatePredictionFieldError(key, errors.value[key], t);
		}
		return resolved;
	});

	async function validate() {
		const result = await validateForm();
		return result.valid;
	}

	function updateField(payload: FieldUpdate) {
		setFieldValue(payload.key, payload.value, true);
	}

	function reset() {
		const defaults = { ...initialFormValues };
		resetVeeForm({ values: defaults });
		formState.value = defaults;
		storedForm.value = defaults;
	}

	return {
		form,
		fieldErrors,
		validate,
		updateField,
		reset
	};
}
