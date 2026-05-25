<script setup lang="ts">
import { cn } from '~/lib/utils';

defineProps<{
	class?: string;
}>();
</script>

<template>
	<div :class="cn('rounded-md bg-primary/10', !$props.class?.includes('animate-') && 'animate-pulse', $props.class)">
		<slot />
	</div>
</template>
