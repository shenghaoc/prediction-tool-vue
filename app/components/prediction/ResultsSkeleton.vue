<script setup lang="ts">
import Skeleton from '~/components/ui/Skeleton.vue';
</script>

<template>
	<div class="flex flex-col gap-4" aria-hidden>
		<div class="grid grid-cols-3 gap-2 max-sm:grid-cols-1">
			<Skeleton v-for="i in 3" :key="i" class="animate-shimmer h-[60px] rounded-sm" />
		</div>
		<Skeleton class="animate-shimmer h-px w-full" />
		<div class="space-y-3">
			<Skeleton class="animate-shimmer h-3 w-32 rounded-sm" />
			<Skeleton class="animate-shimmer h-4 w-48 rounded-sm" />
			<div class="grid grid-cols-3 gap-2 max-sm:grid-cols-1">
				<Skeleton v-for="i in 3" :key="i" class="animate-shimmer h-14 rounded-sm" />
			</div>
			<Skeleton class="animate-shimmer h-[240px] w-full rounded-sm" />
		</div>
	</div>
</template>
