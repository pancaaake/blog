import rss from '@astrojs/rss';
import { SITE } from '../site.config.mjs';
import { getPublishedPosts, url } from '../lib/posts';

export async function GET(context) {
  const posts = await getPublishedPosts();
  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      link: url(`posts/${post.id}/`),
    })),
  });
}
