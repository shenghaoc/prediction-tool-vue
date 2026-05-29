import { reactive } from 'vue';
import { initialFormValues, MAX_LEASE_COMMENCE_YEAR, type FieldType } from '~/utils/prediction';

export type FieldUpdate = {
	[K in keyof FieldType]: { key: K; value: FieldType[K] };
}[keyof FieldType];

export function usePredictionForm() {
	const { t } = useI18n();

	// Persisted to localStorage; `mergeDefaults` reconciles older/partial stored
	// shapes against the current field set. SSR-safe: returns defaults on the
	// server and hydrates from storage on the client.
	const form = useLocalStorage<FieldType>('form', { ...initialFormValues }, {
		mergeDefaults: true
	});
	const fieldErrors = reactive<Record<keyof FieldType, string>>({
		ml_model: '',
		town: '',
		storey_range: '',
		flat_model: '',
		floor_area_sqm: '',
		lease_commence_date: ''
	});

	function clearErrors() {
		for (const key of Object.keys(fieldErrors) as Array<keyof FieldType>) {
			fieldErrors[key] = '';
		}
	}

	function validate() {
		clearErrors();
		const values = form.value;

		if (!values.ml_model) {
			fieldErrors.ml_model = t('missing_ml_model');
		}

		if (!values.town) {
			fieldErrors.town = t('missing_town');
		}

		if (!values.storey_range) {
			fieldErrors.storey_range = t('missing_storey_range');
		}

		if (!values.flat_model) {
			fieldErrors.flat_model = t('missing_flat_model');
		}

		if (!Number.isFinite(values.floor_area_sqm)) {
			fieldErrors.floor_area_sqm = t('missing_floor_area');
		} else if (values.floor_area_sqm < 20 || values.floor_area_sqm > 300) {
			fieldErrors.floor_area_sqm = t('floor_area_range');
		}

		if (!Number.isFinite(values.lease_commence_date)) {
			fieldErrors.lease_commence_date = t('missing_lease_commence_date');
		} else if (
			values.lease_commence_date < 1960 ||
			values.lease_commence_date > MAX_LEASE_COMMENCE_YEAR
		) {
			fieldErrors.lease_commence_date = t('lease_commence_date_range');
		}

		return !Object.values(fieldErrors).some(Boolean);
	}

	function updateField(payload: FieldUpdate) {
		form.value = {
			...form.value,
			[payload.key]: payload.value
		};

		fieldErrors[payload.key] = '';
	}

	function reset() {
		form.value = { ...initialFormValues };
		clearErrors();
	}

	return { form, fieldErrors, clearErrors, validate, updateField, reset };
}
