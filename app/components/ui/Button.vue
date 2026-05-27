<script setup lang="ts">
import { cva } from 'class-variance-authority';
import { cn } from '~/lib/utils';

const buttonVariants = cva(
	'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
	{
		variants: {
			variant: {
				default: 'bg-primary text-primary-foreground hover:bg-primary/90',
				destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
				outline:
					'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
				secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
				ghost: 'hover:bg-accent hover:text-accent-foreground',
				link: 'text-primary underline-offset-4 hover:underline'
			},
			size: {
				default: 'h-8 px-4 py-1',
				sm: 'h-7 px-3 text-xs',
				lg: 'h-9 px-8',
				icon: 'h-8 w-8'
			}
		},
		defaultVariants: {
			variant: 'default',
			size: 'default'
		}
	}
);

type ButtonVariant = NonNullable<Parameters<typeof buttonVariants>[0]>['variant'];
type ButtonSize = NonNullable<Parameters<typeof buttonVariants>[0]>['size'];

defineProps<{
	variant?: ButtonVariant;
	size?: ButtonSize;
	class?: string;
}>();
</script>

<template>
	<button :class="cn(buttonVariants({ variant, size }), $props.class)">
		<slot />
	</button>
</template>
