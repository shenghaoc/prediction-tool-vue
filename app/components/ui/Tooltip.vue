<script setup lang="ts">
import { cn } from '~/lib/utils';
import {
	TooltipArrow,
	TooltipContent,
	TooltipPortal,
	TooltipProvider,
	TooltipRoot,
	TooltipTrigger
} from 'radix-vue';

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
	<TooltipProvider :delay-duration="delayDuration ?? 300">
		<TooltipRoot>
			<TooltipTrigger as-child>
				<slot />
			</TooltipTrigger>
			<TooltipPortal>
				<TooltipContent
					:class="
						cn(
							'z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
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
	</TooltipProvider>
</template>
