<script setup lang="ts">
import { computed } from 'vue';
import type { Component } from 'vue';
import { cn } from '~/lib/utils';
import Tooltip from '~/components/ui/Tooltip.vue';

const props = defineProps<{
	icon: Component;
	label: string;
	value: string;
	hint?: string;
	class?: string;
}>();

const tileClasses = computed(() =>
	cn(
		'group/tile flex items-center gap-2.5 rounded-sm border border-border bg-card/90 px-3 py-2 transition-all duration-200',
		'hover:-translate-y-px hover:border-primary/20',
		props.hint && 'cursor-help',
		props.class
	)
);
</script>

<template>
	<Tooltip v-if="hint">
		<template #content>
			<span class="max-w-[220px] text-center leading-relaxed">{{ hint }}</span>
		</template>
		<div :class="tileClasses">
			<div
				class="flex size-7 shrink-0 items-center justify-center rounded-sm bg-primary/10 ring-1 ring-primary/15"
				aria-hidden
			>
				<component :is="icon" class="size-4 text-primary" />
			</div>
			<div class="flex min-w-0 flex-col gap-0.5">
				<span class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
					{{ label }}
				</span>
				<strong class="font-sans text-base font-extrabold tabular-nums tracking-tight text-primary">
					{{ value }}
				</strong>
			</div>
		</div>
	</Tooltip>

	<div v-else :class="tileClasses">
		<div
			class="flex size-7 shrink-0 items-center justify-center rounded-sm bg-primary/10 ring-1 ring-primary/15"
			aria-hidden
		>
			<component :is="icon" class="size-4 text-primary" />
		</div>
		<div class="flex min-w-0 flex-col gap-0.5">
			<span class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
				{{ label }}
			</span>
			<strong class="font-sans text-base font-extrabold tabular-nums tracking-tight text-primary">
				{{ value }}
			</strong>
		</div>
	</div>
</template>
