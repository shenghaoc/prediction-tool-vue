<script setup lang="ts">
defineProps<{
	icon: string;
	label: string;
	value: string;
	hint?: string;
}>();
</script>

<template>
	<UCard
		variant="subtle"
		:ui="{ body: 'flex items-center gap-3 p-4 sm:p-4' }"
		class="h-full transition-transform hover:-translate-y-0.5"
	>
		<UAvatar :icon="icon" color="primary" variant="soft" size="md" />
		<div class="min-w-0 flex-1">
			<div class="flex items-center gap-1">
				<p class="text-xs font-medium uppercase tracking-wide text-muted">{{ label }}</p>
				<UTooltip v-if="hint" :text="hint">
					<UButton
						icon="i-heroicons-information-circle"
						size="xs"
						color="neutral"
						variant="ghost"
						class="min-h-0 p-0.5"
						aria-label="More information"
					/>
				</UTooltip>
			</div>
			<p class="text-2xl font-bold tabular-nums text-highlighted">{{ value }}</p>
		</div>
	</UCard>
</template>
