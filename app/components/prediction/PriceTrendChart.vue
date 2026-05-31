<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import {
	CategoryScale,
	Chart as ChartJS,
	Filler,
	LineElement,
	LinearScale,
	PointElement,
	Tooltip,
	type ChartData,
	type ChartOptions
} from 'chart.js';
import { Line } from 'vue-chartjs';

import { formatCurrency } from '~/utils/format';
import { formatCurrencyTick, normalizePrice, type PredictionTheme, type TrendPoint } from '~/utils/prediction';

const { t } = useI18n();

const props = defineProps<{
	data: TrendPoint[];
	theme: PredictionTheme;
}>();

const isMobile = ref(false);

function updateViewport() {
	if (!import.meta.client) {
		return;
	}

	isMobile.value = window.innerWidth < 900;
}

onMounted(() => {
	updateViewport();
	window.addEventListener('resize', updateViewport);
});

onBeforeUnmount(() => {
	if (import.meta.client) {
		window.removeEventListener('resize', updateViewport);
	}
});

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Tooltip,
	Filler
);

const chartData = computed<ChartData<'line'>>(() => ({
	labels: props.data.map((entry) => entry.label),
	datasets: [
		{
			data: props.data.map((entry) => entry.value),
			fill: true,
			tension: 0.4,
			borderWidth: 3,
			pointRadius: 0,
			pointHoverRadius: 4,
			pointHoverBorderWidth: 2,
			borderColor: props.theme.chartLine,
			backgroundColor: (context) => {
				const chart = context.chart;
				const area = chart.chartArea;
				if (!area) {
					return `${props.theme.chartLine}26`;
				}

				const gradient = chart.ctx.createLinearGradient(0, area.top, 0, area.bottom);
				gradient.addColorStop(0, `${props.theme.chartLine}66`);
				gradient.addColorStop(0.65, `${props.theme.chartLine}1f`);
				gradient.addColorStop(1, `${props.theme.chartLine}00`);
				return gradient;
			},
			pointHoverBackgroundColor: props.theme.panelStrong,
			pointHoverBorderColor: props.theme.chartLine
		}
	]
}));

const chartOptions = computed<ChartOptions<'line'>>(() => ({
	responsive: true,
	maintainAspectRatio: false,
	interaction: {
		mode: 'index',
		intersect: false
	},
	animation: {
		duration: 600
	},
	plugins: {
		legend: {
			display: false
		},
		tooltip: {
			displayColors: false,
			backgroundColor: props.theme.panelStrong,
			borderColor: props.theme.lineSoft,
			borderWidth: 1,
			padding: 12,
			titleColor: props.theme.textMuted,
			bodyColor: props.theme.text,
			titleFont: { size: 11, weight: 'bold' },
			bodyFont: { size: 13, weight: 'bold' },
			callbacks: {
				label: (context) => formatCurrency(normalizePrice(Number(context.raw)))
			}
		}
	},
	scales: {
		x: {
			grid: { display: false },
			border: { display: false },
			ticks: {
				color: props.theme.textMuted,
				maxRotation: 0,
				autoSkipPadding: 18,
				font: {
					family: "'Source Sans 3', 'Segoe UI', sans-serif",
					size: isMobile.value ? 11 : 12
				}
			}
		},
		y: {
			grid: {
				color: props.theme.chartGrid,
				tickBorderDash: [3, 10]
			},
			border: { display: false },
			ticks: {
				color: props.theme.textMuted,
				callback: (value) => formatCurrencyTick(Number(value)),
				font: {
					family: "'Source Sans 3', 'Segoe UI', sans-serif",
					size: isMobile.value ? 11 : 12
				}
			}
		}
	}
}));
</script>

<template>
	<div class="prediction-chart-frame" role="img" :aria-label="t('price_trend_chart_aria')">
		<Line :data="chartData" :options="chartOptions" />
	</div>
</template>
