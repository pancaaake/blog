// 用語集（src/content/glossary/*.md）の読み込みと、本文中の用語をツールチップに変換する rehype プラグイン。
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

// これらの要素の中にある文字は変換しない
const SKIP_TAGS = new Set([
  'a', 'button', 'code', 'pre', 'kbd', 'samp', 'script', 'style',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'svg', 'math', 'iframe', 'textarea',
]);

const ASCII_WORD = /[A-Za-z0-9_]/;

/** Markdown の本文をツールチップ用の1行のテキストにする */
function toPlainText(markdown) {
  return markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^#+\s*/gm, '')
    .replace(/(\*\*|__|`)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function glossaryFiles(dir, ext = '.md') {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(ext))
    .sort()
    .map((name) => path.join(dir, name));
}

/**
 * ディレクトリ内のファイルの内容から作るハッシュ値。Markdown プラグインの設定に含めると、
 * そのファイル（用語集やプラグイン自身）が変わったときに Astro が「設定が変わった」と判断して
 * 記事のキャッシュを捨て、全記事を作り直す。
 */
export function dirDigest(dir, ext = '.md') {
  const hash = crypto.createHash('sha256');
  for (const file of glossaryFiles(path.resolve(dir), ext)) {
    hash.update(path.basename(file)).update('\0').update(fs.readFileSync(file)).update('\0');
  }
  return hash.digest('hex').slice(0, 16);
}

/** 用語集のディレクトリを読み、{ id, term, aliases, description } の配列を返す */
export function loadGlossary(dir) {
  return glossaryFiles(dir)
    .map((file) => {
      const name = path.basename(file);
      const source = fs.readFileSync(file, 'utf8');
      const match = source.match(FRONTMATTER);
      const data = (match && parseYaml(match[1])) || {};
      const body = match ? source.slice(match[0].length) : source;
      const id = name.replace(/\.md$/, '');
      return {
        id,
        term: String(data.term ?? id),
        aliases: (data.aliases ?? []).map(String),
        description: data.description ? String(data.description) : toPlainText(body),
      };
    })
    .filter((entry) => entry.description);
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** 英数字の用語が単語の途中で一致していないか（"ERA" が "ERAS" に一致するなど） */
function isWordBoundaryOk(text, start, end) {
  const word = text.slice(start, end);
  if (ASCII_WORD.test(word[0]) && start > 0 && ASCII_WORD.test(text[start - 1])) return false;
  if (ASCII_WORD.test(word.at(-1)) && end < text.length && ASCII_WORD.test(text[end])) return false;
  return true;
}

function hasClass(node, name) {
  const value = node.properties?.className;
  return Array.isArray(value) ? value.includes(name) : value === name;
}

function buildTerm(word, entry, tipId) {
  return {
    type: 'element',
    tagName: 'span',
    properties: { className: ['term'] },
    children: [
      {
        type: 'element',
        tagName: 'button',
        properties: { type: 'button', className: ['term__word'], ariaDescribedBy: tipId },
        children: [{ type: 'text', value: word }],
      },
      {
        type: 'element',
        tagName: 'span',
        properties: { id: tipId, role: 'tooltip', className: ['term__tip'] },
        children: [{ type: 'text', value: entry.description }],
      },
    ],
  };
}

/**
 * @param {{ dir: string, digest?: string, firstOnly?: boolean }} options
 *   dir: 用語集のディレクトリ / digest: dirDigest(dir) の値（キャッシュ無効化用）
 *   firstOnly: 記事内で各用語の最初の1回だけ変換する（既定 true）
 */
export function rehypeGlossary({ dir, firstOnly = true }) {
  const glossaryDir = path.resolve(dir);
  // 用語集が変わると開発サーバーごと再起動する（glossaryIntegration）ので、読み込みは起動時の1回でよい
  const entries = loadGlossary(glossaryDir);

  const byWord = new Map();
  for (const entry of entries) {
    for (const word of [entry.term, ...entry.aliases]) {
      if (word && !byWord.has(word)) byWord.set(word, entry);
    }
  }
  // 長い語から順に並べ、「長打率」が「打率」より優先して一致するようにする
  const words = [...byWord.keys()].sort((a, b) => b.length - a.length);
  const pattern = words.length ? new RegExp(words.map(escapeRegExp).join('|'), 'g') : null;

  return (tree, file) => {
    if (!pattern) return;
    // 用語集そのものの本文と、frontmatter で glossary: false にした記事は対象外
    if (file.path && path.resolve(file.path).startsWith(glossaryDir + path.sep)) return;
    if (file.data?.astro?.frontmatter?.glossary === false) return;

    const used = new Set();
    let count = 0;

    function splitText(text) {
      const nodes = [];
      let last = 0;
      pattern.lastIndex = 0;
      let match;
      while ((match = pattern.exec(text))) {
        const start = match.index;
        const end = start + match[0].length;
        const entry = byWord.get(match[0]);
        if (!isWordBoundaryOk(text, start, end) || (firstOnly && used.has(entry.id))) {
          pattern.lastIndex = start + 1;
          continue;
        }
        used.add(entry.id);
        if (start > last) nodes.push({ type: 'text', value: text.slice(last, start) });
        nodes.push(buildTerm(match[0], entry, `term-tip-${++count}`));
        last = end;
      }
      if (last === 0) return null;
      if (last < text.length) nodes.push({ type: 'text', value: text.slice(last) });
      return nodes;
    }

    function walk(parent) {
      const next = [];
      for (const child of parent.children) {
        if (child.type === 'text') {
          const replaced = splitText(child.value);
          if (replaced) next.push(...replaced);
          else next.push(child);
          continue;
        }
        if (
          child.type === 'element' &&
          !SKIP_TAGS.has(child.tagName) &&
          !hasClass(child, 'term') &&
          child.properties?.dataNoGlossary === undefined
        ) {
          walk(child);
        }
        next.push(child);
      }
      parent.children = next;
    }

    walk(tree);
  };
}

/**
 * 開発サーバーの起動中に用語ファイルを編集・追加・削除したら、サーバーを再起動して全記事に反映する。
 */
export function glossaryIntegration({ dir }) {
  const glossaryDir = path.resolve(dir);
  let configFile;

  return {
    name: 'glossary',
    hooks: {
      'astro:config:setup': ({ config, addWatchFile }) => {
        configFile = fileURLToPath(new URL('./astro.config.mjs', config.root));
        for (const file of glossaryFiles(glossaryDir)) addWatchFile(file);
      },
      'astro:server:setup': ({ server }) => {
        // 既存ファイルの編集は addWatchFile で再起動される。追加・削除は設定ファイルの変更として通知する
        const restart = (file) => {
          if (path.resolve(file).startsWith(glossaryDir + path.sep) && file.endsWith('.md')) {
            server.watcher.emit('change', configFile);
          }
        };
        server.watcher.on('add', restart);
        server.watcher.on('unlink', restart);
      },
    },
  };
}
