import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// 主表：提示词金库
export const prompts = sqliteTable('prompts', {
	id: text('id').primaryKey(),
	title: text('title').notNull(),
	content: text('content').notNull(),
	tags: text('tags', { mode: 'json' }).$type<string[]>().notNull().default(sql`'[]'`),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`)
});

// FTS5 虚拟表映射（用于 Drizzle 的静态类型与查询生成）
export const promptsFts = sqliteTable('prompts_fts', {
	id: text('id'), // 关联 prompts.id，将在 FTS 中被设为 UNINDEXED
	title: text('title'),
	content: text('content'),
	tags: text('tags')
});
