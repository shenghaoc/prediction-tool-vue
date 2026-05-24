<script setup lang="ts">
import { cn } from '~/lib/utils';
import {
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectItemIndicator,
	SelectItemText,
	SelectLabel,
	SelectPortal,
	SelectRoot,
	SelectScrollDownButton,
	SelectScrollUpButton,
	SelectTrigger,
	SelectValue,
	SelectViewport
} from 'radix-vue';
import { Check, ChevronDown, ChevronUp } from '@lucide/vue';

defineProps<{
	class?: string;
	triggerClass?: string;
	contentClass?: string;
	placeholder?: string;
	items: Array<{ value: string; label: string }>;
	modelValue?: string;
}>();

const emit = defineEmits<{
	'update:modelValue': [value: string];
}>();
</script>

<template>
	<SelectRoot :model-value="modelValue" @update:model-value="emit('update:modelValue', $event as string)">
		<SelectTrigger
			:class="
				cn(
					'flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:truncate',
					triggerClass
				)
			"
		>
			<SelectValue :placeholder="placeholder" />
			<ChevronDown class="size-4 opacity-50" />
		</SelectTrigger>

		<SelectPortal>
			<SelectContent
				:class="
					cn(
						'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
						contentClass
					)
				"
				:side-offset="4"
			>
				<SelectScrollUpButton class="flex cursor-default items-center justify-center py-1">
					<ChevronUp class="size-4" />
				</SelectScrollUpButton>
				<SelectViewport class="p-1">
					<SelectGroup>
						<SelectLabel v-if="$slots.label" class="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
							<slot name="label" />
						</SelectLabel>
						<SelectItem
							v-for="item in items"
							:key="item.value"
							:value="item.value"
							class="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
						>
							<SelectItemIndicator class="absolute right-2 flex items-center">
								<Check class="size-4" />
							</SelectItemIndicator>
							<SelectItemText>{{ item.label }}</SelectItemText>
						</SelectItem>
					</SelectGroup>
				</SelectViewport>
				<SelectScrollDownButton class="flex cursor-default items-center justify-center py-1">
					<ChevronDown class="size-4" />
				</SelectScrollDownButton>
			</SelectContent>
		</SelectPortal>
	</SelectRoot>
</template>
