<template>
	<client-only>
		<el-menu class="el-menu" mode="horizontal">
			<el-menu-item index="1">Prediction Tool</el-menu-item>
		</el-menu>
	</client-only>
	<el-form :model="form" label-width="120px">
		<el-form-item label="ML Model">
			<client-only>
				<el-select-v2
					v-model="form.ml_model"
					:options="ml_model_list_lv"
					placeholder="Please select"
					size="large"
				/>
			</client-only>
		</el-form-item>
		<el-form-item label="Town">
			<client-only>
				<el-select-v2
					v-model="form.town"
					:options="town_list_lv"
					placeholder="Please select"
					size="large"
				/>
			</client-only>
		</el-form-item>
		<el-form-item label="Storey Range">
			<client-only>
				<el-select-v2
					v-model="form.storey_range"
					:options="storey_range_list_lv"
					placeholder="Please select"
					size="large"
				/>
			</client-only>
		</el-form-item>
		<el-form-item label="Flat Model">
			<client-only>
				<el-select-v2
					v-model="form.flat_model"
					:options="flat_model_list_lv"
					placeholder="Please select"
					size="large"
				/>
			</client-only>
		</el-form-item>
		<el-form-item label="Floor Area">
			<el-input-number v-model="form.floor_area_sqm" :min="1" />
		</el-form-item>
		<el-form-item label="Lease Commence Date">
			<client-only>
				<el-date-picker
					v-model="form.lease_commence_date"
					type="year"
					placeholder="Pick a year"
					:disabled-date="disabledDate"
				/>
			</client-only>
		</el-form-item>
		<el-form-item>
			<el-button type="primary" @click="onSubmit">Submit</el-button>
		</el-form-item>
	</el-form>
	<el-statistic title="Prediction" :value="output" prefix="$" precision="2" />
	<LineChart :chartData="chartData" :key="output" />
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue';

import {
	ElMenu,
	ElSelectV2,
	ElInputNumber,
	ElDatePicker,
	ElForm,
	ElFormItem,
	ElStatistic
} from 'element-plus';

import { ml_model_list } from '~/assets/lists';
import { town_list } from '~/assets/lists';
import { storey_range_list } from '~/assets/lists';
import { flat_model_list } from '~/assets/lists';

const ml_model_list_lv = ml_model_list.map((ml_model, _) => ({ label: ml_model, value: ml_model }));
const town_list_lv = town_list.map((town, _) => ({ label: town, value: town }));
const storey_range_list_lv = storey_range_list.map((storey_range, _) => ({
	label: storey_range,
	value: storey_range
}));
const flat_model_list_lv = flat_model_list.map((flat_model, _) => ({
	label: flat_model,
	value: flat_model
}));

import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(isBetween);

let curr = dayjs.utc('2022-02', 'YYYY-MM');
let labels = [...Array(13).keys()]
	.reverse()
	.map((x) => curr.subtract(x, 'month').format('YYYY-MM'));

const output = ref(0.0);
let chartData = {
	labels: labels,
	datasets: [
		{
			label: 'Sample Trends',
			data: labels.map(() => 0.0),
			borderColor: 'rgb(255, 99, 132)',
			backgroundColor: 'rgba(255, 99, 132, 0.5)'
		}
	]
};

// do not use same name with ref
const form = reactive({
	ml_model: 'Support Vector Regression',
	town: 'ANG MO KIO',
	storey_range: '01 TO 03',
	flat_model: '2-room',
	floor_area_sqm: 1,
	lease_commence_date: curr.toDate()
});

const onSubmit = () => {
	const formData = new FormData();
	formData.append("ml_model", form.ml_model);
	formData.append("month_start", curr.subtract(12, 'month').format('YYYY-MM'));
	formData.append("month_end", curr.format('YYYY-MM'));
	formData.append("town", form.town);
	formData.append("storey_range", form.storey_range);
	formData.append("flat_model", form.flat_model);
	formData.append("floor_area_sqm", form.floor_area_sqm.toString());
	formData.append("lease_commence_date", dayjs(form.lease_commence_date).year().toString());
	const res = fetch(
		'https://ee4802-g20-tool.shenghaoc.workers.dev/api/prices',
		{
			method: 'POST', // *GET, POST, PUT, DELETE, etc.
			body: formData
		}
	);
	res.then((response) =>
		response.json().then((server_data: [{ labels: string; data: number }]) => {
			chartData = {
				labels: server_data.map((x: { labels: string; data: number }) => x['labels']),
				datasets: [
					{
						label: 'Trends',
						data: server_data.map((x: { labels: string; data: number }) => x['data']),
						borderColor: 'rgb(53, 162, 235)',
						backgroundColor: 'rgba(53, 162, 235, 0.5)'
					}
				]
			};
			output.value = server_data[server_data.length - 1]['data'];
		})
	);
};

const disabledDate = (time: Date) => {
	return !dayjs.utc(time).isBetween('1960-01-01', '2022-02-01', 'year'); // compares month and year
};
</script>
