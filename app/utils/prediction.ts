import { Temporal } from '@js-temporal/polyfill';

import {
	FLAT_MODELS,
	ML_MODELS,
	MONTHS,
	STOREY_RANGES,
	TOWNS,
	type FlatModel,
	type MLModel,
	type StoreyRange,
	type Town
} from '~/utils/lists';

export type FieldType = {
	ml_model: MLModel;
	town: Town;
	storey_range: StoreyRange;
	flat_model: FlatModel;
	floor_area_sqm: number;
	lease_commence_date: number;
};

export type TrendPoint = {
	label: string;
	value: number;
};

export type SummaryValues = Pick<FieldType, 'ml_model' | 'town' | 'lease_commence_date'>;

export type ApiResponse = {
	predictions: Array<{ month: string; predictedPrice: number }>;
};

export type PredictionTheme = ReturnType<typeof getPredictionTheme>;

export const MAX_LEASE_COMMENCE_YEAR = Temporal.PlainYearMonth.from(
	MONTHS[MONTHS.length - 1]!
).year;
export const YEAR_OPTIONS = Array.from(
	{ length: MAX_LEASE_COMMENCE_YEAR - 1960 + 1 },
	(_, index) => MAX_LEASE_COMMENCE_YEAR - index
);

export const initialFormValues: FieldType = {
	ml_model: ML_MODELS[0],
	town: TOWNS[0],
	storey_range: STOREY_RANGES[0],
	flat_model: FLAT_MODELS[0],
	floor_area_sqm: 20,
	lease_commence_date: MAX_LEASE_COMMENCE_YEAR
};

export function defaultTrendData(): TrendPoint[] {
	return MONTHS.slice(-13).map((label) => ({
		label,
		value: 0
	}));
}

export function getPredictionWindow() {
	return {
		monthStart: MONTHS[MONTHS.length - 13] ?? MONTHS[0],
		monthEnd: MONTHS[MONTHS.length - 1]
	};
}

export function normalizePrice(value: number) {
	if (!Number.isFinite(value)) {
		return 0;
	}

	return Math.max(0, Math.round(value));
}

export function normalizeTrendData(data: ApiResponse): TrendPoint[] {
	return data.predictions.map((entry) => ({
		label: entry.month,
		value: normalizePrice(entry.predictedPrice)
	}));
}

export function formatCurrencyTick(value: number) {
	if (value >= 1_000_000) {
		return `$${(value / 1_000_000).toFixed(1)}M`;
	}

	if (value >= 1_000) {
		return `$${Math.round(value / 1_000)}k`;
	}

	return `$${Math.round(value)}`;
}

export function trendDataHasValidPrices(points: TrendPoint[]): boolean {
	return points.some((point) => point.value > 0);
}

export function getPredictionTheme(darkMode: boolean) {
	if (darkMode) {
		return {
			text: '#e8eaf0',
			textMuted: '#94a3b8',
			primary: '#818cf8',
			accent: '#a5b4fc',
			lineSoft: 'rgba(129, 140, 248, 0.16)',
			panelBg: '#1a1c25',
			panelStrong: '#1a1c25',
			resultsBg: '#1a1c25',
			resultsBg2: '#1e2029',
			pricePanelBg: 'rgba(129, 140, 248, 0.08)',
			fieldBg: '#1e2029',
			focusRing: 'rgba(129, 140, 248, 0.18)',
			shadow: 'rgba(0, 0, 0, 0.24)',
			accentShadow: 'rgba(129, 140, 248, 0.18)',
			meshLine: 'rgba(255, 255, 255, 0.04)',
			orbColor: 'rgba(129, 140, 248, 0.12)',
			chartGrid: '#2a2d3a',
			chartLine: '#818cf8',
			background: '#0f1117',
			pageBg: '#0f1117',
			pillBg: 'rgba(129, 140, 248, 0.08)'
		};
	}

	return {
		text: '#1a1a2e',
		textMuted: '#64748b',
		primary: '#4f46e5',
		accent: '#6366f1',
		lineSoft: 'rgba(79, 70, 229, 0.14)',
		panelBg: '#ffffff',
		panelStrong: '#ffffff',
		resultsBg: '#ffffff',
		resultsBg2: '#eef0f4',
		pricePanelBg: 'rgba(79, 70, 229, 0.06)',
		fieldBg: '#eef0f4',
		focusRing: 'rgba(79, 70, 229, 0.14)',
		shadow: 'rgba(79, 70, 229, 0.08)',
		accentShadow: 'rgba(79, 70, 229, 0.14)',
		meshLine: 'rgba(79, 70, 229, 0.04)',
		orbColor: 'rgba(79, 70, 229, 0.10)',
		chartGrid: '#dde1e8',
		chartLine: '#4f46e5',
		background: '#f4f5f7',
		pageBg: '#f4f5f7',
		pillBg: 'rgba(79, 70, 229, 0.06)'
	};
}
