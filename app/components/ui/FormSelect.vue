<script setup lang="ts" generic="T extends string">
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
	items: Array<{ value: T; label: string }>;
	modelValue?: T;
}>();

const emit = defineEmits<{
	'update:modelValue': [value: T];
}>();
</script>

<template>
	<Field :label="label" :label-for="labelFor" :error="error" :hint="hint" :class="cn($props.class)">
		<Select
			:id="labelFor"
			:model-value="modelValue"
			:placeholder="placeholder"
			:items="items"
			@update:model-value="emit('update:modelValue', $event as T)"
		/>
	</Field>
</template>
