<template>
	<div class="flex flex-col gap-6" aria-hidden>
		<div class="space-y-2 text-center">
			<USkeleton class="mx-auto h-3 w-20" />
			<USkeleton class="mx-auto h-12 w-56" />
		</div>
		<USkeleton class="h-px w-full" />
		<div class="grid grid-cols-3 gap-3 max-sm:grid-cols-1">
			<USkeleton v-for="i in 3" :key="i" class="h-14" />
		</div>
		<USkeleton class="h-[240px] w-full" />
	</div>
</template>
