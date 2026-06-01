<template>
	<div class="flex flex-col gap-4" aria-hidden>
		<div class="grid grid-cols-3 gap-2 max-sm:grid-cols-1">
			<USkeleton v-for="i in 3" :key="i" class="h-[60px] rounded-sm" />
		</div>
		<USkeleton class="h-px w-full" />
		<div class="space-y-3">
			<USkeleton class="h-3 w-32 rounded-sm" />
			<USkeleton class="h-4 w-48 rounded-sm" />
			<div class="grid grid-cols-3 gap-2 max-sm:grid-cols-1">
				<USkeleton v-for="i in 3" :key="i" class="h-14 rounded-sm" />
			</div>
			<USkeleton class="h-[240px] w-full rounded-sm" />
		</div>
	</div>
</template>
