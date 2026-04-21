# Prompt Vault

## Architecture State (架构与状态流转)
* **Database Schema**: Drizzle ORM 配置完成，包含物理表 `prompts` 与 FTS5 虚拟表 `prompts_fts`。Wrangler 迁移路径已对齐至 `drizzle/migrations`。
* **Framework**: SvelteKit (Svelte 5 with Runes).
* **Deployment**: Cloudflare Workers/Pages (via @sveltejs/adapter-cloudflare).
* **Database**: Cloudflare D1 + FTS5 (Full-Text Search).
* **ORM**: Drizzle ORM.
* **Styling**: TailwindCSS. OLED Minimalist UI.

## Lessons Learned & DON'Ts (踩坑与教训)
* **DON'T DO**: 绝不盲目信任 `drizzle-kit generate` 对 FTS5 表的生成结果。它默认生成标准物理表，必须手动拦截并修改迁移 SQL 为 `CREATE VIRTUAL TABLE ... USING fts5`，且关联 ID 需标记为 `UNINDEXED`。
* **DON'T DO**: 绝对不能漏掉在 `wrangler.toml` 中配置 `migrations_dir = "drizzle/migrations"`，否则 Wrangler 默认去根目录找迁移文件导致报错。
* **DON'T DO**: 严禁使用 Next.js 等重型 SSR 框架，避免引入过度设计和不必要的运行时开销。
* **DON'T DO**: 绝对禁止使用 D1 Trigger 进行 FTS5 虚拟表的同步操作。必须在代码层显式双写。
* **DON'T DO**: 严禁使用旧版 Svelte (Svelte 3/4) 的响应式语法 (`export let`, `$:`)，必须强制使用 Svelte 5 的 Runes (`$state`, `$props`, `$derived`)。

## New Conventions (新共识与规范)
* **Schema 变更流转**: 所有数据库变更必须严格遵循：修改 `schema.ts` -> `drizzle-kit generate` -> 审查/手术刀修正 FTS5 相关的 SQL -> `wrangler d1 migrations apply`。
* **单体边缘全栈 (Edge Monolith)**: 视图层与 Worker 逻辑统一在 SvelteKit 工程内流转，通过 `+page.server.ts` 直接安全调用 Drizzle 和 D1。
* **全局样式管控**: 所有样式必须遵循 OLED 极简黑白绿设计语言，去除多余阴影与边框。

## Phase 1: UI Shell & Architecture Setup (Completed)
* **Architecture State**: 采用最新的 Svelte 5 `sv` CLI 构建了纯净骨架，并完成了 OLED 暗黑极简美学（Tailwind v4）的全局注入。
* **Lessons Learned**: 
  * Svelte 5 已全面废弃旧版 `create-svelte`，必须使用全新的 `sv create` 初始化项目，否则会导致环境严重破坏。
  * **DON'T DO**: 在 Svelte 组件中渲染带双大括号的提示词变量（如 `{{variable}}`）时，绝对禁止直接编写。Svelte 编译器会将其误认为响应式绑定。必须使用 HTML 实体进行转义：`&#123;&#123;variable&#125;&#125;`。

## Phase 2: Data Layer & FTS5 Setup (Completed)
* **Architecture State**: 搭建了 D1 的 Drizzle ORM 数据层，利用 FTS5 构建了搜索虚拟表，跑通了本地 Wrangler 迁移闭环。

## Phase 3: Application Layer & Double-Write (Completed)
* **Architecture State**: 贯通了 UI 层至 D1 数据库的双写逻辑。在 `src/routes/+page.server.ts` 中利用 SvelteKit Form Actions 接收前端提交，并通过 Drizzle 的 `db.batch()` 实现了物理表 `prompts` 与虚拟表 `prompts_fts` 的强一致性事务操作。
* **Lessons Learned**: 
  * **DON'T DO**: 再次强调，绝对禁止尝试在 D1 中挂载 Trigger 来同步虚拟表。必须在 Worker 层捕获数据流并显式执行 `db.batch` 双写。
  * FTS5 的分词器无法原生检索序列化的 JSON 数组格式，必须在双写进入虚拟表时，将 `tags` 数组显式拍平为以空格分隔的纯文本（`tags.join(' ')`），否则全文检索的词根拆分会彻底失效。
* **New Conventions**:
  * 安全规范：所有写入 D1 的数据变更必须被封装在 SvelteKit 的 `+page.server.ts` Action 内流转，严禁在客户端直连。
  * 探针规范：本地使用 curl 绕过浏览器测试 SvelteKit Actions 时，必须显式携带与目标一致的 `Origin` header，否则会被内置的 CSRF 防护直接拦截。

## Phase 4: UI Write Flow & Data Binding (Completed)
* **Architecture State**: 实现了前端视图层 (`+page.svelte`) 与服务端 Action (`?/create`) 的安全连通。利用 SvelteKit 的 `use:enhance` 实现了无刷新表单提交，并通过 Svelte 5 的 `$props()` 成功渲染了从 D1 数据库拉取的 Prompt 列表。
* **Lessons Learned**: 
  * 维持 OLED 极简美学时，表单元素（Input/Textarea）需使用透明背景 (`bg-transparent`) 与焦点高亮边框 (`focus:border-[#39FF14]`)，避免破坏整体的暗黑沉浸感。
* **New Conventions**:
  * 视图层数据接收必须严格使用 Svelte 5 的 `let { data, form } = $props();`，绝对禁止回退到 Svelte 3/4 的 `export let` 语法。

## Phase 5: Search & Read Flow (Completed)
* **Architecture State**: 实现了 FTS5 的实时全文检索。前端通过 SvelteKit 的 `goto` 与 URL `?q=` 强绑定，实现无刷新的防抖（Debounce）搜索；服务端基于 Drizzle 的 `sql` 模板语法，将 `prompts` 物理表与 `prompts_fts` 虚拟表进行 `innerJoin`，完成 `MATCH` 检索。
* **Lessons Learned**:
  * 前端在 `<input>` 上绑定动态 `goto` 路由跳转时，必须携带 `{ keepFocus: true, replaceState: true, noScroll: true }`，否则会导致输入框瞬间失焦、页面跳动且污染浏览器历史记录。
* **New Conventions**:
  * 虚拟表查询规范：针对 FTS5 虚拟表的查询，必须使用 `innerJoin` 与物理表强关联（`eq(prompts.id, promptsFts.id)`），确保能安全返回完整的字段类型，严禁直接 `select * from prompts_fts`。

## Phase 6: Production Deployment (Completed)
* **Architecture State**: 成功将 SvelteKit Edge Monolith 部署至 Cloudflare Workers（而非 Pages），以获得更快的冷启动和更低延迟的 D1 原生绑定。通过代码化配置 (IaC) 在 `wrangler.toml` 中直接绑定了生产级 D1 数据库和自定义域名 `prompter.onidame.qzz.io`。
* **Lessons Learned & DON'Ts**:
  * **DON'T DO**: 严禁在 `wrangler.toml` 中使用内联表语法（如 `routes = [{...}]`）来配置路由。必须严格遵守标准 TOML 的表数组语法（`[[routes]]`），否则极易导致 Wrangler 解析失败并拒绝部署。
  * 部署全栈单体时，优先考虑直接作为 Worker 部署，而非传统的 Pages 静态托管附加 Functions 的模式。
* **New Conventions**:
  * **生产绑定规范**: 无论 Cloudflare CLI 自动生成的生产数据库绑定名是什么（例如 `prompt_vault_db`），在更新 `wrangler.toml` 时，**必须强制将其改回我们在代码中约定的 `binding = "DB"`**，仅替换 `database_id`。这样才能保证 `platform.env.DB` 逻辑在开发和生产环境无缝流转。

## Phase 7: UX Polishing & Accessibility (Completed)
* **Architecture State**: 完善了视图层的剪贴板交互逻辑。利用 Svelte 5 的 `$state` 和 `svelte/transition` (`fade`) 实现了轻量级的全局 Toast 反馈，并为卡片节点补充了完整的无障碍 (a11y) 属性 (`role`, `tabindex`, 键盘事件监听)。
* **Lessons Learned & DON'Ts**: 
  * **DON'T DO**: 严禁在 `<div/>` 等非原生交互元素上只绑定 `onclick`。必须配套 `role="button"`、`tabindex="0"` 和 `onkeydown` (监听 Enter 键)，以确保可以通过键盘聚焦和触发。
  * **DON'T DO**: 遇到 D1 数据库 "Failed query: select ..." 报错时，绝对禁止盲目重置或重新生成迁移。必须先执行 `npx wrangler d1 migrations list DB --local` 获取确凿的本地未迁移证据后，再执行 `apply`。
* **New Conventions**:
  * **状态反馈规范**: 坚持 OLED 极简美学，拒绝引入臃肿的第三方 Toast UI 库。所有临时 UI 反馈均应直接使用 Svelte 原生 `$state` 与内置的 `transition` 配合绝对定位 (fixed) 容器实现。

## Phase 8: Destructive Mutations & Global State (Completed)
* **Architecture State**: 实现了 Prompt 的安全删除功能。利用 Drizzle `db.batch()` 达成了物理表与虚拟表的强一致性 Double-Delete。引入了全局 `<Dialog>` 拦截器，基于 Svelte 5 `$state` (`promptToDelete`) 与 `use:enhance` 回调机制实现了高危操作的无刷新两步确认。
* **Lessons Learned & DON'Ts**:
  * **DON'T DO**: 绝不在绑定了全局点击事件（如卡片复制）的父容器内直接放置高危形态的提交按钮。必须在按钮的 `onclick` 和 `onkeydown` 中强制调用 `e.stopPropagation()` 阻断事件冒泡，否则会引发不可预期的幽灵交互（例如删除的同时触发了复制 Toast）。
  * **DON'T DO**: 绝不裸露破坏性变更 (Destructive Mutations)。D1 的删除是硬删除，必须在触发 Action 前挂载状态机制进行二次阻断。
* **New Conventions**:
  * **高危弹窗规范**: 凡涉及数据库写/删操作的阻断性 UI，统一通过抽象的 `src/lib/components/Dialog.svelte` 渲染，利用 Svelte 5 的 `{@render children()}` (Snippets) 注入特定业务表单。

## Phase 9: Edit Flow & State Mutability (Completed)
* **Architecture State**: 贯通了 Prompt 的修改闭环。服务端在 `+page.server.ts` 中新增了 `?/update` Action，继续严格执行 D1 物理表与 FTS5 虚拟表的 `db.batch()` 双写更新；前端复用了全局 `<Dialog>` 组件，引入 `$state` `promptToEdit` 驱动编辑弹窗。
* **Lessons Learned & DON'Ts**:
  * **DON'T DO**: 当在一个已经绑定了全局点击事件（如卡片级别的 Copy）的容器内部并排增加多个交互按钮（如 Edit 和 Delete）时，绝对禁止漏掉 `e.stopPropagation()`。否则编辑动作不仅会弹窗，还会触发底层卡片的复制操作，导致幽灵状态。
  * 对于 FTS5 虚拟表的更新，必须像插入时一样，再次执行 `tags.join(' ')` 将数组拍平，否则更新后该条目的 Tag 检索将永久失效。
* **New Conventions**:
  * **组件复用规范**: 全局阻断性交互（Delete, Edit）统一复用已沉淀的 `<Dialog>` 骨架，通过注入不同的 `form` action 和不同的状态触发器（`promptToDelete` vs `promptToEdit`）实现逻辑分流，保持 DOM 结构的极简。

## Phase 10: Zero-Svelte Dual-Track Theme (Completed)
* **Architecture State**: 彻底抛弃了基于纯黑 OLED 的单轨美学，重构为基于 Opencode 极简灰黑质感的明暗双轨自适应主题 (Dark/Light)。状态流转完全剥离出 Svelte 的响应式生命周期，下沉至最底层的 Native DOM 与原生 CSS 媒体查询。
* **Lessons Learned & DON'Ts**:
  * **DON'T DO**: 严禁使用 Svelte 的 `$state` 或 `onMount` 来初始化全局主题（这属于典型的过度设计）。这会不可避免地导致在 SSR 或页面冷启动时产生刺眼的无样式闪烁 (FOUC)。
* **New Conventions**:
  * **防闪烁规范**: 必须在 `src/app.html` 的 `<head>` 中注入同步的 Vanilla JS 脚本，在 DOM 渲染前阻断并直接计算 `localStorage.theme` 与系统偏好，向 `<html>` 挂载 `.dark`。
  * **无状态 Toggle 规范**: ThemeToggle 组件内部绝不允许存在任何框架级状态变量，其点击交互必须直接表现为原生的 `document.documentElement.classList.toggle('dark')` 并同步 `localStorage`。

## Phase 11: Schema Normalization & Tag Taxonomy (Completed)
* **Architecture State**: 完成了 Tag 数据结构的范式化重构，为未来的多租户隔离打下基础。移除了 `prompts` 表的 JSON `tags` 字段，新增 `tags` 物理表与 `prompt_tags` 关联表。引入了 `+layout.server.ts` 全局拉取标签树供侧边栏渲染。
* **Lessons Learned & DON'Ts**:
  * **DON'T DO**: 严禁在引入范式化关联表后，盲目修改前端的搜索路由状态（如引入 `?tag=`）。既然 FTS5 虚拟表中已经包含拍平的 `tags.join(' ')`，前端继续复用 `?q=` 即可实现原生 MATCH 标签检索，保持视图层对底层 Schema 变更的绝对无感。
* **New Conventions**:
  * **关联数据双写规范**: 在处理多对多关系（如新建/更新 Prompt 及其 Tags）时，必须在 D1 Batch 事务中手动处理 Tag 的去重插入 (Upsert) 以及 `prompt_tags` 的绑定/清理，同时**绝对不能遗漏**向 FTS 虚拟表双写拍平后的字符串。

## Form Interaction Conventions (Phase 11)
- **Keyboard Shortcuts in SvelteKit Forms**: When implementing `Ctrl+Enter` or `Cmd+Enter` to submit forms from inside a `<textarea>`, always intercept the `keydown` event and invoke `e.preventDefault(); e.currentTarget.form?.requestSubmit();`. This perfectly integrates with SvelteKit's `use:enhance` by triggering the native DOM submit event (which SvelteKit intercepts) rather than bypassing it, while safely preventing unwanted newline insertions.
