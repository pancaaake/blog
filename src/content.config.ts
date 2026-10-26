import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const posts = defineCollection({
  loader: glob({ base: './src/content/posts', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    // false にすると、この記事では用語のツールチップ化をしない
    glossary: z.boolean().default(true),
  }),
});

const glossary = defineCollection({
  loader: glob({ base: './src/content/glossary', pattern: '**/*.md' }),
  schema: z.object({
    term: z.string(),
    // 用語集ページの並び順に使う読み仮名（省略時は term で並べる）
    reading: z.string().optional(),
    aliases: z.array(z.string()).default([]),
    // 省略時は本文がツールチップに表示される
    description: z.string().optional(),
  }),
});

export const collections = { posts, glossary };
