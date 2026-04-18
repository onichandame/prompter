<div class="w-full max-w-5xl mx-auto mb-16 sticky top-0 bg-black pt-4 pb-8 z-20">
    <input type="text" placeholder="Type to search... (Cmd+K)" autofocus
        class="w-full bg-transparent border-b border-gray-800 text-3xl md:text-5xl py-4 focus:outline-none focus:border-white transition-colors placeholder-gray-800 tracking-tight font-light">
    <div class="absolute right-0 bottom-12 text-gray-600 font-mono text-xs hidden md:block">
        Press Enter to copy top result
    </div>
</div>

<div class="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    
    <div class="border border-gray-900 p-6 hover:border-gray-600 transition-colors cursor-pointer group flex flex-col h-64">
        <h3 class="font-medium mb-3 text-lg tracking-tight group-hover:text-white text-gray-200">Strict Code Reviewer</h3>
        <p class="text-gray-500 text-sm leading-relaxed line-clamp-5 flex-1">You are a strict code reviewer. Analyze the following code for security vulnerabilities, performance bottlenecks, and adherence to clean code principles. Suggest concrete improvements without rewriting the entire file unless necessary. Be terse and direct.</p>
        <div class="mt-4 flex justify-between items-center text-xs font-mono text-gray-700">
            <span>Used 142x</span>
            <span class="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400">Click to copy</span>
        </div>
    </div>

    <div class="border border-gray-900 p-6 hover:border-gray-600 transition-colors cursor-pointer group flex flex-col h-64 relative">
        <div class="absolute top-6 right-6 w-2 h-2 rounded-full bg-blue-500"></div>
        <h3 class="font-medium mb-3 text-lg tracking-tight group-hover:text-white text-gray-200">API Documentation</h3>
        <p class="text-gray-500 text-sm leading-relaxed line-clamp-5 flex-1">Generate markdown API documentation for the following endpoint: &#123;&#123;endpoint_url&#125;&#125;. Include expected request headers, payload structure for method &#123;&#123;method&#125;&#125;, and standard response codes.</p>
        <div class="mt-4 flex justify-between items-center text-xs font-mono text-gray-700">
            <span>Used 89x</span>
            <span class="opacity-0 group-hover:opacity-100 transition-opacity text-blue-400">Tab to fill &#123;&#123;...&#125;&#125;</span>
        </div>
    </div>

    <div class="border border-[#39FF14] p-6 cursor-pointer flex flex-col h-64 relative overflow-hidden bg-black shadow-[0_0_15px_rgba(57,255,20,0.1)]">
        <div class="absolute inset-0 bg-[#39FF14] opacity-5"></div>
        <h3 class="font-medium mb-3 text-lg tracking-tight text-[#39FF14] relative z-10">Git Commit Generator</h3>
        <p class="text-[#39FF14] opacity-70 text-sm leading-relaxed line-clamp-5 flex-1 relative z-10">Generate a conventional commit message based on the following git diff. Ensure it follows the Type/Scope structure. Output only the commit message.</p>
        <div class="mt-4 flex justify-between items-center text-xs font-mono relative z-10 text-[#39FF14]">
            <span>Just now</span>
            <span class="font-bold">Copied to clipboard ✓</span>
        </div>
    </div>

</div>
