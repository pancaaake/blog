import { getCollection } from 'astro:content';

/** 日付付きの記事のコレクション名と URL の対応 */
export const ARTICLE_SECTIONS = {
  posts: { label: '日記', path: 'posts' },
  tech: { label: '技術', path: 'tech' },
} as const;

export type ArticleCollection = keyof typeof ARTICLE_SECTIONS;

/** 公開する記事を新しい順に返す（draft: true は本番ビルドから除外） */
export async function getPublishedPosts(collection: ArticleCollection = 'posts') {
  const posts = await getCollection(collection, ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/** 記事のサイト内 URL */
export function articleUrl(collection: ArticleCollection, id: string) {
  return url(`${ARTICLE_SECTIONS[collection].path}/${id}/`);
}

/** base（/blog）を付けたサイト内のURLを返す */
export function url(path = '') {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/${path.replace(/^\//, '')}`;
}

export function formatDate(date: Date) {
  return date.toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Tokyo' });
}
