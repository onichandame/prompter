import { drizzle } from 'drizzle-orm/d1';
import { sql, eq } from 'drizzle-orm';
import { prompts, tags, promptTags } from '$lib/server/db/schema';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ platform }) => {
    if (!platform?.env?.DB) return { tags: [], totalPrompts: 0 };
    const db = drizzle(platform.env.DB);

    const total = await db.select({ count: sql<number>`count(*)` }).from(prompts);
    const tagsData = await db.select({
        name: tags.name,
        count: sql<number>`count(${promptTags.promptId})`
    })
    .from(tags)
    .innerJoin(promptTags, eq(tags.id, promptTags.tagId))
    .groupBy(tags.id)
    .orderBy(tags.name);

    return {
        tags: tagsData,
        totalPrompts: total[0].count
    };
};
