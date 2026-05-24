<script setup lang="ts">
import type { Component } from 'vue';
import { cn } from '~/lib/utils';
import Tooltip from '~/components/ui/Tooltip.vue';

defineProps<{
	icon: Component;
	label: string;
	value: string;
	hint?: string;
	class?: string;
}>();
</script>

<template>
	<Tooltip v-if="hint">
		<template #content>
			<span class="max-w-[220px] text-center leading-relaxed">{{ hint }}</span>
		</template>
		<div
			:class="
				cn(
					'group/tile flex items-center gap-3 rounded-xl border border-border/60 bg-card/90 p-4 shadow-sm transition-all duration-300',
					'hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md hover:shadow-primary/5',
					'cursor-help',
					$props.class
				)
			"
		>
			<div
				class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/15 transition-all duration-300 group-hover/tile:bg-primary/15 group-hover/tile:ring-primary/25"
				aria-hidden
			>
				<component :is="icon" class="size-5 text-primary" />
			</div>
			<div class="flex min-w-0 flex-col gap-0.5">
				<span class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
					{{ label }}
				</span>
				<strong class="font-heading text-xl font-extrabold tabular-nums tracking-tight text-primary">
					{{ value }}
				</strong>
			</div>
		</div>
	</Tooltip>

	<div
		v-else
		:class="
			cn(
				'group/tile flex items-center gap-3 rounded-xl border border-border/60 bg-card/90 p-4 shadow-sm transition-all duration-300',
				'hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md hover:shadow-primary/5',
				$props.class
			)
		"
	>
		<div
			class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/15 transition-all duration-300 group-hover/tile:bg-primary/15 group-hover/tile:ring-primary/25"
			aria-hidden
		>
			<component :is="icon" class="size-5 text-primary" />
		</div>
		<div class="flex min-w-0 flex-col gap-0.5">
			<span class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
				{{ label }}
			</span>
			<strong class="font-heading text-xl font-extrabold tabular-nums tracking-tight text-primary">
				{{ value }}
			</strong>
		</div>
	</div>
</template>
