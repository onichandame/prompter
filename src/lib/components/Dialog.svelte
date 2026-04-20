<script lang="ts">
    import { fade } from 'svelte/transition';
    let { isOpen, title, message, oncancel, children } = $props();
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && isOpen && oncancel()} />

	{#if isOpen}
		<div
			class="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/20 dark:bg-black/80 backdrop-blur-sm"
			transition:fade={{ duration: 150 }}
			role="dialog"
			aria-modal="true"
			onclick={oncancel}
		>
			<div
				class="bg-white dark:bg-[#0d0d0d] border border-zinc-200 dark:border-zinc-800 p-6 max-w-md w-full shadow-2xl flex flex-col gap-4 mx-4"
				onclick={(e) => e.stopPropagation()}
			>
				<h3 class="text-zinc-900 dark:text-white text-xl font-medium tracking-tight">{title}</h3>
				<p class="text-zinc-500 dark:text-zinc-400 font-mono text-sm leading-relaxed">{message}</p>
				<div class="flex justify-end items-center gap-2 mt-4">
					{@render children?.()}
				</div>
			</div>
		</div>
	{/if}
