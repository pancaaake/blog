import rss from '@astrojs/rss';
import { SITE } from '../site.config.mjs';
import { ARTICLE_SECTIONS, articleUrl, getPublishedPosts } from '../lib/posts';

// 日記と技術の記事をまとめて新しい順に配信する
export async function GET(context) {
  const sections = await Promise.all(
    Object.keys(ARTICLE_SECTIONS).map(async (collection) =>
      (await getPublishedPosts(collection)).map((post) => ({ collection, post })),
    ),
  );
  const items = sections
    .flat()
    .sort((a, b) => b.post.data.date.getTime() - a.post.data.date.getTime())
    .map(({ collection, post }) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      categories: [ARTICLE_SECTIONS[collection].label, ...post.data.tags],
      link: articleUrl(collection, post.id),
    }));

  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site,
    items,
  });
}
