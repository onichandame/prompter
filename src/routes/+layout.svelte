<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';

	let { children } = $props();
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
    <title>Prompt Vault</title>
</svelte:head>

<div class="h-screen flex flex-col md:flex-row overflow-hidden bg-white dark:bg-[#0d0d0d] text-zinc-900 dark:text-zinc-300 selection:bg-zinc-200 dark:selection:bg-zinc-800 transition-colors duration-200">
	<aside class="w-64 border-r border-zinc-200 dark:border-zinc-800 p-8 hidden md:flex flex-col">
		<div class="flex items-center justify-between mb-12">
			<h1 class="text-2xl font-bold tracking-tighter text-black dark:text-white">Vault.</h1>
			<ThemeToggle />
		</div>
		<nav class="space-y-6 text-sm text-zinc-500 dark:text-zinc-400 font-mono">
			<div class="text-black dark:text-white cursor-pointer transition-colors flex justify-between">
				<span># all</span>
				<span>142</span>
			</div>
			<div class="hover:text-zinc-800 dark:hover:text-zinc-300 cursor-pointer transition-colors flex justify-between">
				<span># coding</span>
				<span>58</span>
			</div>
			<div class="hover:text-zinc-800 dark:hover:text-zinc-300 cursor-pointer transition-colors flex justify-between">
				<span># system</span>
				<span>12</span>
			</div>
		</nav>
		<div class="mt-auto text-xs text-zinc-400 dark:text-zinc-600 font-mono flex items-center justify-between">
			<span>Syncing</span>
			<span class="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-700 animate-pulse"></span>
		</div>
	</aside>

	<main class="flex-1 flex flex-col overflow-y-auto hide-scrollbar p-6 md:p-16 relative">
		<div class="absolute top-4 right-4 md:hidden">
			<ThemeToggle />
		</div>
        {@render children()}
    </main>
</div>
