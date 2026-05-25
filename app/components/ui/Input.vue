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
				'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
				!!error && 'border-destructive focus-visible:ring-destructive',
				$props.class
			)
		"
	>
</template>
