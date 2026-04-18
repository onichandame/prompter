import { drizzle } from 'drizzle-orm/d1';
import { prompts, promptsFts } from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
    if (!platform?.env?.DB) {
        console.warn("[DB Warning] Missing D1 binding in platform.env");
        return { prompts: [] };
    }
    const db = drizzle(platform.env.DB);
    const allPrompts = await db.select().from(prompts).orderBy(prompts.createdAt);
    return {
        prompts: allPrompts
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

        const tags = tagsString.split(',').map(t => t.trim()).filter(Boolean);
        const id = crypto.randomUUID();

        try {
            // [Architect Core]: Explicit Double-Write via D1 Batch
            await db.batch([
                db.insert(prompts).values({
                    id,
                    title,
                    content,
                    tags
                }),
                db.insert(promptsFts).values({
                    id,
                    title,
                    content,
                    tags: tags.join(' ') // FTS requires a flat string for tokenization
                })
            ]);

            return { success: true };
        } catch (e: any) {
            console.error('[Double-write Failed]:', e);
            return fail(500, { message: 'Failed to create prompt' });
        }
    }
};
