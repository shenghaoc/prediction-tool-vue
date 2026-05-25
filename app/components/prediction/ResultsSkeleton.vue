<script setup lang="ts">
import Skeleton from '~/components/ui/Skeleton.vue';
</script>

<template>
	<div class="flex flex-col gap-5" aria-hidden>
		<div class="grid grid-cols-3 gap-2.5 max-sm:grid-cols-1">
			<Skeleton v-for="i in 3" :key="i" class="animate-shimmer h-[72px] rounded-xl" />
		</div>
		<Skeleton class="animate-shimmer h-px w-full" />
		<div class="space-y-3">
			<Skeleton class="animate-shimmer h-3 w-32 rounded-md" />
			<Skeleton class="animate-shimmer h-4 w-48 rounded-md" />
			<div class="grid grid-cols-3 gap-2.5 max-sm:grid-cols-1">
				<Skeleton v-for="i in 3" :key="i" class="animate-shimmer h-16 rounded-xl" />
			</div>
			<Skeleton class="animate-shimmer h-[260px] w-full rounded-xl" />
		</div>
	</div>
</template>
