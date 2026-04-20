<script lang="ts">
    import { enhance } from '$app/forms';
    import { goto } from '$app/navigation';
        import { fade } from 'svelte/transition';
        import Dialog from '$lib/components/Dialog.svelte';
        let { data, form } = $props();

    let searchTimer: ReturnType<typeof setTimeout>;
    let promptToDelete = $state<{id: string, title: string} | null>(null);
    let promptToEdit = $state<{id: string, title: string, content: string, tags: string[]} | null>(null);
    let copiedContent = $state<string | null>(null);

    async function copyToClipboard(text: string) {
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
            copiedContent = text;
            setTimeout(() => {
                if (copiedContent === text) copiedContent = null;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    }

    function handleInputKeydown(e: KeyboardEvent) {
        if (e.key === 'Enter' && data.prompts?.length > 0) {
            e.preventDefault();
            copyToClipboard(data.prompts[0].content);
        }
    }

    function handleSearch(e: Event) {
        clearTimeout(searchTimer);
        const val = (e.target as HTMLInputElement).value;
        searchTimer = setTimeout(() => {
            const url = new URL(window.location.href);
            if (val) {
                url.searchParams.set('q', val);
            } else {
                url.searchParams.delete('q');
            }
            // keepFocus prevents input cursor loss, noScroll prevents page jump
            goto(url.toString(), { keepFocus: true, replaceState: true, noScroll: true });
        }, 300);
    }
</script>

<div class="w-full max-w-5xl mx-auto mb-16 sticky top-0 bg-black pt-4 pb-8 z-20">
        <input type="text" placeholder="Type to search... (Cmd+K)" autofocus
            value={data.searchQuery}
            oninput={handleSearch}
            onkeydown={handleInputKeydown}
            class="w-full bg-transparent border-b border-gray-800 text-3xl md:text-5xl py-4 focus:outline-none focus:border-white transition-colors placeholder-gray-800 tracking-tight font-light">
    <div class="absolute right-0 bottom-12 text-gray-600 font-mono text-xs hidden md:block">
        Press Enter to copy top result
    </div>
</div>

<div class="w-full max-w-5xl mx-auto mb-12">
    <form method="POST" action="?/create" use:enhance class="border border-gray-900 p-6 flex flex-col gap-4">
        <h2 class="text-[#39FF14] font-medium tracking-tight">Create New Vault Entry</h2>
        {#if form?.message}
            <p class="text-red-500 text-xs font-mono">{form.message}</p>
        {/if}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" name="title" placeholder="Prompt Title" required class="bg-transparent border border-gray-800 p-3 focus:outline-none focus:border-[#39FF14] text-gray-200 transition-colors">
            <input type="text" name="tags" placeholder="Tags (comma separated)" class="bg-transparent border border-gray-800 p-3 focus:outline-none focus:border-[#39FF14] text-gray-200 transition-colors">
        </div>
        <textarea name="content" placeholder="Prompt Content... use &#123;&#123;variable&#125;&#125; for templates" required rows="3" class="bg-transparent border border-gray-800 p-3 focus:outline-none focus:border-[#39FF14] text-gray-200 transition-colors resize-y font-mono text-sm"></textarea>
        <div class="flex justify-end">
            <button type="submit" class="bg-[#39FF14] text-black px-6 py-2 font-medium hover:bg-white transition-colors">Save to Vault</button>
        </div>
    </form>
</div>

<div class="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each data.prompts as prompt}
                <div
                    class="relative border border-gray-900 p-6 hover:border-gray-600 transition-colors cursor-pointer group flex flex-col h-64"
                    role="button"
                    tabindex="0"
                    onclick={() => copyToClipboard(prompt.content)}
                    onkeydown={(e) => e.key === 'Enter' && copyToClipboard(prompt.content)}
                >
                    <div class="flex justify-between items-start mb-3">
                            <h3 class="font-medium text-lg tracking-tight group-hover:text-white text-gray-200">{prompt.title}</h3>
                            <div class="flex gap-3">
                                <button
                                    type="button"
                                    aria-label="Edit prompt"
                                    class="text-gray-800 hover:text-[#39FF14] transition-colors focus:outline-none"
                                    onclick={(e) => {
                                        e.stopPropagation();
                                        promptToEdit = { id: prompt.id, title: prompt.title, content: prompt.content, tags: prompt.tags || [] };
                                    }}
                                    onkeydown={(e) => e.stopPropagation()}
                                >
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                </button>
                                <button
                                    type="button"
                                    aria-label="Delete prompt"
                                    class="text-gray-800 hover:text-red-500 transition-colors focus:outline-none"
                                    onclick={(e) => {
                                        e.stopPropagation();
                                        promptToDelete = { id: prompt.id, title: prompt.title };
                                    }}
                                    onkeydown={(e) => e.stopPropagation()}
                                >
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            </div>
                        </div>
                    <p class="text-gray-500 text-sm leading-relaxed line-clamp-5 flex-1 font-mono">{prompt.content}</p>
                <div class="mt-4 flex justify-between items-center text-xs font-mono text-gray-700">
                    <span>{prompt.tags ? prompt.tags.join(', ') : 'No tags'}</span>
                    <span class="{copiedContent === prompt.content ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity text-[#39FF14]">
                        {copiedContent === prompt.content ? 'Copied!' : 'Click to copy'}
                    </span>
                </div>
            </div>
        {/each}
        {#if data.prompts.length === 0}
            <div class="col-span-full border border-gray-900 p-6 text-center text-gray-600 font-mono text-sm">
                Vault is empty. Create your first prompt above.
            </div>
        {/if}
    </div>

    {#if copiedContent}
            <div transition:fade={{ duration: 200 }} class="fixed top-8 right-8 bg-black border border-[#39FF14] text-[#39FF14] px-5 py-3 z-50 font-mono text-sm flex items-center gap-2 shadow-2xl">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                Copied to clipboard
            </div>
        {/if}

        <Dialog
            isOpen={!!promptToDelete}
            title="Delete Prompt"
            message={`Are you sure you want to permanently delete "${promptToDelete?.title}"? This action cannot be undone.`}
            oncancel={() => promptToDelete = null}
        >
            <button class="px-5 py-2 text-gray-500 hover:text-white transition-colors font-mono text-sm focus:outline-none" onclick={() => promptToDelete = null}>Cancel</button>
            <form method="POST" action="?/delete" use:enhance={() => {
                return async ({ update }) => {
                    await update();
                    promptToDelete = null;
                };
            }}>
                <input type="hidden" name="id" value={promptToDelete?.id} />
                <button type="submit" class="bg-red-900/20 text-red-500 border border-red-900 hover:bg-red-500 hover:text-black hover:border-red-500 px-6 py-2 transition-colors font-medium font-mono text-sm focus:outline-none">Confirm Delete</button>
            </form>
        </Dialog>

        <Dialog
            isOpen={!!promptToEdit}
            title="Edit Prompt"
            message=""
            oncancel={() => promptToEdit = null}
        >
            <form method="POST" action="?/update" class="w-full flex flex-col gap-4 mt-2" use:enhance={() => {
                return async ({ update }) => {
                    await update();
                    promptToEdit = null;
                };
            }}>
                <input type="hidden" name="id" value={promptToEdit?.id} />
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" name="title" value={promptToEdit?.title} placeholder="Prompt Title" required class="bg-transparent border border-gray-800 p-3 focus:outline-none focus:border-[#39FF14] text-gray-200 transition-colors">
                    <input type="text" name="tags" value={promptToEdit?.tags.join(', ')} placeholder="Tags (comma separated)" class="bg-transparent border border-gray-800 p-3 focus:outline-none focus:border-[#39FF14] text-gray-200 transition-colors">
                </div>
                <textarea name="content" value={promptToEdit?.content} placeholder="Prompt Content..." required rows="6" class="bg-transparent border border-gray-800 p-3 focus:outline-none focus:border-[#39FF14] text-gray-200 transition-colors resize-y font-mono text-sm w-full"></textarea>
                
                <div class="flex justify-end gap-3 mt-2">
                    <button type="button" class="px-5 py-2 text-gray-500 hover:text-white transition-colors font-mono text-sm focus:outline-none" onclick={() => promptToEdit = null}>Cancel</button>
                    <button type="submit" class="bg-[#39FF14] text-black px-6 py-2 transition-colors font-medium hover:bg-white focus:outline-none text-sm">Save Changes</button>
                </div>
            </form>
        </Dialog>
