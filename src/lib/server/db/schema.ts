import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// 主表：提示词金库
export const prompts = sqliteTable('prompts', {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    content: text('content').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

// FTS5 虚拟表映射
export const promptsFts = sqliteTable('prompts_fts', {
    id: text('id'), // 关联 prompts.id，将在 FTS 中被设为 UNINDEXED
    title: text('title'),
    content: text('content'),
    tags: text('tags')
});

// 独立标签表
export const tags = sqliteTable('tags', {
    id: text('id').primaryKey(),
    name: text('name').notNull().unique(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

// 多对多关联表
export const promptTags = sqliteTable('prompt_tags', {
    promptId: text('prompt_id').notNull().references(() => prompts.id, { onDelete: 'cascade' }),
    tagId: text('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
}, (t) => ({
    pk: primaryKey({ columns: [t.promptId, t.tagId] })
}));
