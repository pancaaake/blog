import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// 日付付きの記事（日記・技術）で共通の frontmatter
const articleSchema = z.object({
  title: z.string(),
  date: z.coerce.date(),
  updated: z.coerce.date().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  // false にすると、この記事では用語のツールチップ化をしない
  glossary: z.boolean().default(true),
});

// 日記：src/content/posts/<ファイル名>.md → /posts/<ファイル名>/
const posts = defineCollection({
  loader: glob({ base: './src/content/posts', pattern: '**/*.md' }),
  schema: articleSchema,
});

// 技術：src/content/tech/<ファイル名>.md → /tech/<ファイル名>/
const tech = defineCollection({
  loader: glob({ base: './src/content/tech', pattern: '**/*.md' }),
  schema: articleSchema,
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
    // 用語集ページで見出しごとに分けて表示する（例: プログラミング、野球）
    category: z.string().optional(),
  }),
});

// 日付のない固定ページ。ファイル名がそのまま URL になる（map.md → /map/）
const pages = defineCollection({
  loader: glob({ base: './src/content/pages', pattern: '*.md' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    // 指定するとヘッダーのメニューにこの名前で表示される
    nav: z.string().optional(),
    // メニューの並び順（小さいほど左）
    navOrder: z.number().default(100),
    glossary: z.boolean().default(true),
  }),
});

// ゲーム：1タイトル1フォルダ。フォルダ内の index.md がタイトルの情報、それ以外の .md が攻略メモ
//   src/content/games/<タイトルのフォルダ>/index.md   → /games/<フォルダ>/
//   src/content/games/<タイトルのフォルダ>/<メモ>.md  → /games/<フォルダ>/<メモ>/
const GAMES_DIR = './src/content/games';

const games = defineCollection({
  loader: glob({
    base: GAMES_DIR,
    pattern: '*/index.md',
    generateId: ({ entry }) => entry.replace(/\/index\.md$/, ''),
  }),
  schema: z.object({
    title: z.string(),
    // 一覧の並び順に使う読み仮名（省略時は title で並べる）
    reading: z.string().optional(),
    platforms: z.array(z.string()).default([]),
    description: z.string().optional(),
    draft: z.boolean().default(false),
    glossary: z.boolean().default(true),
  }),
});

const gameNotes = defineCollection({
  loader: glob({
    base: GAMES_DIR,
    pattern: ['*/*.md', '!*/index.md'],
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    // メモの並び順（小さいほど上。章の順番などに使う）
    order: z.number().default(100),
    date: z.coerce.date().optional(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    glossary: z.boolean().default(true),
  }),
});

export const collections = { posts, tech, glossary, pages, games, gameNotes };
