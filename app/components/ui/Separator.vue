<script setup lang="ts">
import { cn } from '~/lib/utils';
import { Separator, type SeparatorProps } from 'radix-vue';

defineProps<
	SeparatorProps & {
		class?: string;
		label?: string;
	}
>();
</script>

<template>
	<Separator
		:orientation="orientation ?? 'horizontal'"
		:class="
			cn(
				'shrink-0 bg-border',
				(orientation ?? 'horizontal') === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
				$props.class
			)
		"
	/>
</template>
