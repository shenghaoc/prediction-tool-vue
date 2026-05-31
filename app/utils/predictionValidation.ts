import type { FieldType } from '~/utils/prediction';

type TranslateFn = (key: string) => string;

function errorMessage(error: unknown): string | undefined {
	if (typeof error === 'string') {
		return error;
	}

	if (error && typeof error === 'object' && 'message' in error) {
		const message = (error as { message?: unknown }).message;
		if (typeof message === 'string') {
			return message;
		}
	}

	return undefined;
}

export function translatePredictionFieldError(
	field: keyof FieldType,
	errors: unknown[] | undefined,
	t: TranslateFn
): string {
	const message = errorMessage(errors?.[0]);
	if (!message) {
		return '';
	}

	switch (field) {
		case 'ml_model':
			return t('missing_ml_model');
		case 'town':
			return t('missing_town');
		case 'storey_range':
			return t('missing_storey_range');
		case 'flat_model':
			return t('missing_flat_model');
		case 'floor_area_sqm':
			if (message === 'invalid_floor_area') {
				return t('missing_floor_area');
			}
			return t('floor_area_range');
		case 'lease_commence_date':
			if (message === 'invalid_lease_commence_date') {
				return t('missing_lease_commence_date');
			}
			return t('lease_commence_date_range');
		default:
			return message;
	}
}
