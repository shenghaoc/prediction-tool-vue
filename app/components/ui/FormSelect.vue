<script setup lang="ts">
import { cn } from '~/lib/utils';
import Field from './Field.vue';
import Select from './Select.vue';

defineProps<{
	class?: string;
	label?: string;
	labelFor?: string;
	error?: string;
	hint?: string;
	placeholder?: string;
	items: Array<{ value: string; label: string }>;
	modelValue?: string;
}>();

const emit = defineEmits<{
	'update:modelValue': [value: string];
}>();
</script>

<template>
	<Field :label="label" :label-for="labelFor" :error="error" :hint="hint" :class="cn($props.class)">
		<Select
			:id="labelFor"
			:model-value="modelValue"
			:placeholder="placeholder"
			:items="items"
			@update:model-value="emit('update:modelValue', $event)"
		/>
	</Field>
</template>
