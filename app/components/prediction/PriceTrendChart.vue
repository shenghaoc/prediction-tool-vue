<script setup lang="ts">
import { computed } from 'vue';
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

const props = defineProps<{
	data: TrendPoint[];
	theme: PredictionTheme;
	isMobile: boolean;
}>();

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
			tension: 0.32,
			borderWidth: 2.75,
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
					family: '"Avenir Next", "Segoe UI", sans-serif',
					size: props.isMobile ? 11 : 12
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
					family: '"Avenir Next", "Segoe UI", sans-serif',
					size: props.isMobile ? 11 : 12
				}
			}
		}
	}
}));
</script>

<template>
	<div class="prediction-chart-frame">
		<Line :data="chartData" :options="chartOptions" />
	</div>
</template>
