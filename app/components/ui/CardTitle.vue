<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '~/lib/utils';

defineProps<{
	// `HTMLAttributes['class']` accepts the string / array / object forms `cn`
	// already handles, so callers can pass conditional class arrays.
	class?: HTMLAttributes['class'];
}>();
</script>

<template>
	<h3 :class="cn('font-semibold leading-none tracking-tight', $props.class)">
		<slot />
	</h3>
</template>
