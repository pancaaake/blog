import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import sitemap from '@astrojs/sitemap';
import remarkDirective from 'remark-directive';
import { remarkEmbeds } from './plugins/embeds.mjs';
import { rehypeGlossary, dirDigest, glossaryIntegration } from './plugins/glossary.mjs';
import { SITE } from './src/site.config.mjs';

const GLOSSARY_DIR = './src/content/glossary';

export default defineConfig({
  site: SITE.url,
  base: SITE.base,
  integrations: [sitemap(), glossaryIntegration({ dir: GLOSSARY_DIR })],
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
    },
    processor: unified({
      // digest は、用語集やプラグインが変わったときに記事のキャッシュを捨てさせるための値
      remarkPlugins: [remarkDirective, [remarkEmbeds, { digest: dirDigest('./plugins', '.mjs') }]],
      rehypePlugins: [[rehypeGlossary, { dir: GLOSSARY_DIR, digest: dirDigest(GLOSSARY_DIR) }]],
    }),
  },
});
