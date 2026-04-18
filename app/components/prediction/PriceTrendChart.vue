<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { Chart as ChartInstance } from 'chart.js';

import { formatCurrency } from '~/utils/format';
import { formatCurrencyTick, normalizePrice, type PredictionTheme, type TrendPoint } from '~/utils/prediction';

const props = defineProps<{
	data: TrendPoint[];
	theme: PredictionTheme;
	isMobile: boolean;
}>();

const canvas = ref<HTMLCanvasElement | null>(null);

let chart: ChartInstance<'line'> | null = null;
let ChartCtor: (typeof import('chart.js/auto'))['default'] | null = null;

function buildGradient() {
	if (!chart) {
		return undefined;
	}

	const { ctx, chartArea } = chart;
	if (!chartArea) {
		return undefined;
	}

	const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
	gradient.addColorStop(0, `${props.theme.chartLine}66`);
	gradient.addColorStop(0.65, `${props.theme.chartLine}1f`);
	gradient.addColorStop(1, `${props.theme.chartLine}00`);
	return gradient;
}

function syncChart() {
	if (!chart) {
		return;
	}

	const labels = props.data.map((entry) => entry.label);
	const values = props.data.map((entry) => entry.value);

	chart.data.labels = labels;
	chart.data.datasets[0].data = values;
	chart.data.datasets[0].borderColor = props.theme.chartLine;
	chart.data.datasets[0].backgroundColor = buildGradient() ?? `${props.theme.chartLine}26`;
	chart.data.datasets[0].pointHoverBackgroundColor = props.theme.panelStrong;
	chart.data.datasets[0].pointHoverBorderColor = props.theme.chartLine;

	chart.options.scales = {
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
	};

	chart.options.plugins = {
		legend: { display: false },
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
	};

	chart.update();
}

async function initChart() {
	if (!import.meta.client || !canvas.value) {
		return;
	}

	if (!ChartCtor) {
		const chartModule = await import('chart.js/auto');
		ChartCtor = chartModule.default;
	}

	chart?.destroy();

	if (!ChartCtor || !canvas.value) {
		return;
	}

	chart = new ChartCtor(canvas.value, {
		type: 'line',
		data: {
			labels: [],
			datasets: [
				{
					data: [],
					fill: true,
					tension: 0.32,
					borderWidth: 2.75,
					pointRadius: 0,
					pointHoverRadius: 4,
					pointHoverBorderWidth: 2
				}
			]
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			interaction: {
				mode: 'index',
				intersect: false
			},
			animation: {
				duration: 600
			}
		}
	});

	syncChart();
}

onMounted(async () => {
	await nextTick();
	await initChart();
});

watch(
	() => [props.data, props.theme, props.isMobile],
	() => {
		if (chart) {
			syncChart();
		}
	},
	{ deep: true }
);

onBeforeUnmount(() => {
	chart?.destroy();
});
</script>

<template>
	<div class="prediction-chart-frame">
		<canvas ref="canvas" />
	</div>
</template>
