<script setup lang="ts">
import { cn } from '~/lib/utils';

defineProps<{
	class?: string;
	label?: string;
	labelFor?: string;
	error?: string;
	hint?: string;
}>();
</script>

<template>
	<div :class="cn('grid gap-1.5', $props.class)">
		<label
			v-if="label"
			:for="labelFor"
			class="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
		>
			{{ label }}
		</label>
		<slot />
		<p v-if="hint && !error" class="text-xs text-muted-foreground">{{ hint }}</p>
		<p v-if="error" class="text-xs text-destructive">{{ error }}</p>
	</div>
</template>
