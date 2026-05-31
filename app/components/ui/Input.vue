<script setup lang="ts">
import { cn } from '~/lib/utils';

defineProps<{
	modelValue?: string;
	error?: string;
	class?: string;
}>();
</script>

<template>
	<input
		:value="modelValue"
		:aria-invalid="!!error || undefined"
		:class="
			cn(
				'flex h-8 w-full rounded-sm border border-input bg-card px-3 py-1 text-sm ring-offset-background transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
				!!error && 'border-destructive focus-visible:ring-destructive',
				$props.class
			)
		"
	>
</template>
