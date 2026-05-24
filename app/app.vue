<script setup lang="ts">
import { TooltipProvider } from 'radix-vue';
</script>

<template>
	<TooltipProvider :delay-duration="300">
		<NuxtPage />
	</TooltipProvider>
</template>
