import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import sitemap from '@astrojs/sitemap';
import remarkDirective from 'remark-directive';
import { remarkEmbeds } from './plugins/embeds.mjs';
import { rehypeGlossary, glossaryDigest, glossaryIntegration } from './plugins/glossary.mjs';
import { SITE } from './src/site.config.mjs';

const GLOSSARY_DIR = './src/content/glossary';

export default defineConfig({
  site: SITE.url,
  base: SITE.base,
  integrations: [sitemap(), glossaryIntegration({ dir: GLOSSARY_DIR })],
  markdown: {
    processor: unified({
      remarkPlugins: [remarkDirective, remarkEmbeds],
      rehypePlugins: [[rehypeGlossary, { dir: GLOSSARY_DIR, digest: glossaryDigest(GLOSSARY_DIR) }]],
    }),
  },
});
