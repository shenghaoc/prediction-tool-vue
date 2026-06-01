<script setup lang="ts">
defineProps<{
	icon: string;
	label: string;
	value: string;
	hint?: string;
}>();
</script>

<template>
	<UTooltip :text="hint" :disabled="!hint">
		<UCard
			variant="subtle"
			:ui="{ body: 'flex items-center gap-3 p-4 sm:p-4' }"
			class="h-full transition-transform hover:-translate-y-0.5"
		>
			<UAvatar :icon="icon" color="primary" variant="soft" size="md" />
			<div class="min-w-0">
				<p class="text-xs font-medium uppercase tracking-wide text-muted">{{ label }}</p>
				<p class="text-2xl font-bold tabular-nums text-highlighted">{{ value }}</p>
			</div>
		</UCard>
	</UTooltip>
</template>
