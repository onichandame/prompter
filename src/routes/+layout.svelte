<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
    <title>Prompt Vault</title>
</svelte:head>

<div class="h-screen flex flex-col md:flex-row overflow-hidden selection:bg-[#39FF14] selection:text-black">
    <aside class="w-64 border-r border-gray-900 p-8 hidden md:flex flex-col">
        <h1 class="text-2xl font-bold tracking-tighter mb-12">Vault.</h1>
        <nav class="space-y-6 text-sm text-gray-500 font-mono">
            <div class="text-white cursor-pointer transition-colors flex justify-between">
                <span># all</span>
                <span>142</span>
            </div>
            <div class="hover:text-gray-300 cursor-pointer transition-colors flex justify-between">
                <span># coding</span>
                <span>58</span>
            </div>
            <div class="hover:text-gray-300 cursor-pointer transition-colors flex justify-between">
                <span># system</span>
                <span>12</span>
            </div>
        </nav>
        <div class="mt-auto text-xs text-gray-600 font-mono flex items-center justify-between">
            <span>Syncing</span>
            <span class="w-2 h-2 rounded-full bg-gray-600 animate-pulse"></span>
        </div>
    </aside>

    <main class="flex-1 flex flex-col overflow-y-auto hide-scrollbar p-6 md:p-16 relative">
        {@render children()}
    </main>
</div>
