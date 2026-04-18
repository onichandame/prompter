# Prompt Vault

## Architecture State (架构与状态流转)
* **Framework**: SvelteKit (Svelte 5 with Runes).
* **Deployment**: Cloudflare Workers/Pages (via @sveltejs/adapter-cloudflare).
* **Database**: Cloudflare D1 + FTS5 (Full-Text Search).
* **ORM**: Drizzle ORM.
* **Styling**: TailwindCSS. OLED Minimalist UI.

## Lessons Learned & DON'Ts (踩坑与教训)
* **DON'T DO**: 严禁使用 Next.js 等重型 SSR 框架，避免引入过度设计和不必要的运行时开销。
* **DON'T DO**: 绝对禁止使用 D1 Trigger 进行 FTS5 虚拟表的同步操作。必须在代码层显式双写。
* **DON'T DO**: 严禁使用旧版 Svelte (Svelte 3/4) 的响应式语法 (`export let`, `$:`)，必须强制使用 Svelte 5 的 Runes (`$state`, `$props`, `$derived`)。

## New Conventions (新共识与规范)
* **单体边缘全栈 (Edge Monolith)**: 视图层与 Worker 逻辑统一在 SvelteKit 工程内流转，通过 `+page.server.ts` 直接安全调用 Drizzle 和 D1。
* **全局样式管控**: 所有样式必须遵循 OLED 极简黑白绿设计语言，去除多余阴影与边框。

## Phase 1: UI Shell & Architecture Setup (Completed)
* **Architecture State**: 采用最新的 Svelte 5 `sv` CLI 构建了纯净骨架，并完成了 OLED 暗黑极简美学（Tailwind v4）的全局注入。
* **Lessons Learned**: 
  * Svelte 5 已全面废弃旧版 `create-svelte`，必须使用全新的 `sv create` 初始化项目，否则会导致环境严重破坏。
  * **DON'T DO**: 在 Svelte 组件中渲染带双大括号的提示词变量（如 `{{variable}}`）时，绝对禁止直接编写。Svelte 编译器会将其误认为响应式绑定。必须使用 HTML 实体进行转义：`&#123;&#123;variable&#125;&#125;`。
