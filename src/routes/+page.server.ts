import { drizzle } from 'drizzle-orm/d1';
import { sql, eq } from 'drizzle-orm';
import { prompts, promptsFts, tags, promptTags } from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform, url }) => {
    const q = url.searchParams.get('q');
    
    if (!platform?.env?.DB) {
        console.warn("[DB Warning] Missing D1 binding in platform.env");
        return { prompts: [], searchQuery: q || '' };
    }
    const db = drizzle(platform.env.DB);
    let allPrompts;

        const baseQuery = db.select({
            id: prompts.id,
            title: prompts.title,
            content: prompts.content,
            tags: sql<string>`COALESCE(GROUP_CONCAT(${tags.name}), '')`,
            createdAt: prompts.createdAt
        })
        .from(prompts)
        .leftJoin(promptTags, eq(prompts.id, promptTags.promptId))
        .leftJoin(tags, eq(promptTags.tagId, tags.id));

        if (q) {
            allPrompts = await baseQuery
                .innerJoin(promptsFts, eq(prompts.id, promptsFts.id))
                .where(sql`${promptsFts} MATCH ${q}`)
                .groupBy(prompts.id)
                .orderBy(prompts.createdAt);
        } else {
            allPrompts = await baseQuery
                .groupBy(prompts.id)
                .orderBy(prompts.createdAt);
        }

        return {
            prompts: allPrompts.map((p: any) => ({ ...p, tags: p.tags ? p.tags.split(',') : [] })),
            searchQuery: q || ''
        };
    };

export const actions: Actions = {
    create: async ({ request, platform }) => {
        if (!platform?.env?.DB) {
            console.error("[DB Error] D1 binding missing during mutation.");
            return fail(500, { message: 'Database connection missing' });
        }

        const db = drizzle(platform.env.DB);
        const formData = await request.formData();
        const title = formData.get('title')?.toString();
        const content = formData.get('content')?.toString();
        const tagsString = formData.get('tags')?.toString() || '';

        if (!title || !content) {
            return fail(400, { message: 'Title and content are required' });
        }

            const inputTags = tagsString.split(',').map(t => t.trim()).filter(Boolean);
            const id = crypto.randomUUID();

            try {
                const tagIds: string[] = [];
                for (const tagName of inputTags) {
                    let existing = await db.select({ id: tags.id }).from(tags).where(eq(tags.name, tagName)).get();
                    if (!existing) {
                        const newTagId = crypto.randomUUID();
                        await db.insert(tags).values({ id: newTagId, name: tagName }).onConflictDoNothing();
                        existing = { id: newTagId };
                    }
                    tagIds.push(existing.id);
                }

                const op1 = db.insert(prompts).values({ id, title, content });
                const op2 = db.insert(promptsFts).values({ id, title, content, tags: inputTags.join(' ') });
                const dynamicOps = tagIds.map(tagId => db.insert(promptTags).values({ promptId: id, tagId }));

                await db.batch([op1, op2, ...dynamicOps]);

                return { success: true };
            } catch (e: any) {
                console.error('[Double-write Failed]:', e);
                return fail(500, { message: 'Failed to create prompt' });
            }
        },
        delete: async ({ request, platform }) => {
            if (!platform?.env?.DB) {
                console.error("[DB Error] D1 binding missing during mutation.");
                return fail(500, { message: 'Database connection missing' });
            }
            
            const db = drizzle(platform.env.DB);
            const formData = await request.formData();
            const id = formData.get('id')?.toString();
            
            if (!id) return fail(400, { message: 'Prompt ID is required' });
            
            try {
                // [Architect Core]: Explicit Double-Delete via D1 Batch
                await db.batch([
                    db.delete(prompts).where(eq(prompts.id, id)),
                    db.delete(promptsFts).where(eq(promptsFts.id, id))
                ]);
                    return { success: true };
                } catch (e: any) {
                    console.error('[Double-delete Failed]:', e);
                    return fail(500, { message: 'Failed to delete prompt' });
                }
            },
            update: async ({ request, platform }) => {
                if (!platform?.env?.DB) {
                    console.error("[DB Error] D1 binding missing during mutation.");
                    return fail(500, { message: 'Database connection missing' });
                }

                const db = drizzle(platform.env.DB);
                const formData = await request.formData();
                const id = formData.get('id')?.toString();
                const title = formData.get('title')?.toString();
                const content = formData.get('content')?.toString();
                const tagsString = formData.get('tags')?.toString() || '';

                if (!id || !title || !content) {
                    return fail(400, { message: 'ID, title, and content are required' });
                }

            const inputTags = tagsString.split(',').map(t => t.trim()).filter(Boolean);

            try {
                const tagIds: string[] = [];
                for (const tagName of inputTags) {
                    let existing = await db.select({ id: tags.id }).from(tags).where(eq(tags.name, tagName)).get();
                    if (!existing) {
                        const newTagId = crypto.randomUUID();
                        await db.insert(tags).values({ id: newTagId, name: tagName }).onConflictDoNothing();
                        existing = { id: newTagId };
                    }
                    tagIds.push(existing.id);
                }

                const op1 = db.update(prompts).set({ title, content, updatedAt: sql`(unixepoch())` }).where(eq(prompts.id, id));
                const op2 = db.update(promptsFts).set({ title, content, tags: inputTags.join(' ') }).where(eq(promptsFts.id, id));
                const op3 = db.delete(promptTags).where(eq(promptTags.promptId, id));
                const dynamicOps = tagIds.map(tagId => db.insert(promptTags).values({ promptId: id, tagId }));

                await db.batch([op1, op2, op3, ...dynamicOps]);

                return { success: true };
                } catch (e: any) {
                    console.error('[Double-update Failed]:', e);
                    return fail(500, { message: 'Failed to update prompt' });
                }
            }
        };
