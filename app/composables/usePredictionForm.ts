import { onMounted, watch } from 'vue';
import { useForm } from '@tanstack/vue-form';

import { predictionFormSchema } from '#shared/predictionSchema';
import { initialFormValues, type FieldType } from '~/utils/prediction';

type UsePredictionFormOptions = {
	onSubmit: (values: FieldType) => void | Promise<void>;
};

function createPredictionForm({ onSubmit }: UsePredictionFormOptions) {
	return useForm({
		defaultValues: { ...initialFormValues },
		validators: {
			onChange: predictionFormSchema
		},
		onSubmit: async ({ value }) => {
			await onSubmit(value as FieldType);
		}
	});
}

export type PredictionFormHandle = ReturnType<typeof createPredictionForm>;

export function usePredictionForm(options: UsePredictionFormOptions) {
	const storedForm = useLocalStorage<FieldType>('form', { ...initialFormValues }, {
		mergeDefaults: true
	});

	const form = createPredictionForm(options);
	const formValues = form.useStore((state) => state.values);

	onMounted(() => {
		const merged = { ...initialFormValues, ...storedForm.value };
		form.reset(merged);
	});

	watch(
		formValues,
		(next) => {
			storedForm.value = { ...next } as FieldType;
		},
		{ deep: true }
	);

	function reset() {
		form.reset();
		storedForm.value = { ...initialFormValues };
	}

	return { form, reset };
}
