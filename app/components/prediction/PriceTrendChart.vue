<script setup lang="ts">
import { computed } from 'vue';
import { use } from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { SVGRenderer } from 'echarts/renderers';
import VChart from 'vue-echarts';
import 'echarts/theme/dark.js';

import { formatCurrency } from '~/utils/format';
import { formatCurrencyTick, normalizePrice, type TrendPoint } from '~/utils/prediction';

const { t, locale } = useI18n();

const props = defineProps<{
	data: TrendPoint[];
	darkMode: boolean;
}>();

use([SVGRenderer, LineChart, GridComponent, TooltipComponent]);

const chartTheme = computed(() => (props.darkMode ? 'dark' : undefined));

const chartOption = computed(() => ({
	xAxis: {
		type: 'category' as const,
		data: props.data.map((entry) => entry.label),
		axisLabel: {
			interval: 'auto' as const
		}
	},
	yAxis: {
		type: 'value' as const,
		axisLabel: {
			formatter: (value: number) => formatCurrencyTick(value)
		}
	},
	series: [
		{
			type: 'line' as const,
			data: props.data.map((entry) => entry.value),
			smooth: true,
			areaStyle: {},
			showSymbol: false
		}
	],
	tooltip: {
		trigger: 'axis' as const,
		valueFormatter: (value: number) => formatCurrency(normalizePrice(value), locale.value)
	},
	grid: {
		left: 12,
		right: 12,
		top: 16,
		bottom: 8,
		containLabel: true
	}
}));
</script>

<template>
	<div class="prediction-chart-frame" role="img" :aria-label="t('price_trend_chart_aria')">
		<VChart
			style="height: 240px; width: 100%"
			:theme="chartTheme"
			:option="chartOption"
			:init-options="{ renderer: 'svg' }"
			autoresize
		/>
	</div>
</template>
