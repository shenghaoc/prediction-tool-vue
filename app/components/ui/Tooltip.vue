<script setup lang="ts">
import { cn } from '~/lib/utils';
import {
	TooltipArrow,
	TooltipContent,
	TooltipPortal,
	TooltipRoot,
	TooltipTrigger
} from 'reka-ui';

defineProps<{
	class?: string;
	contentClass?: string;
	delayDuration?: number;
}>();

defineSlots<{
	default: () => unknown;
	content: () => unknown;
}>();
</script>

<template>
	<TooltipRoot :delay-duration="delayDuration ?? 300">
		<TooltipTrigger as-child>
			<slot />
		</TooltipTrigger>
		<TooltipPortal>
			<TooltipContent
				:class="
					cn(
						'z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground',
						contentClass
					)
				"
				:side-offset="4"
			>
				<slot name="content" />
				<TooltipArrow class="fill-primary" :width="8" :height="4" />
			</TooltipContent>
		</TooltipPortal>
	</TooltipRoot>
</template>
