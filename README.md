# pancake blog

Markdown ファイルを追加・更新するだけで記事が増えるブログです。[Astro](https://astro.build/) で作り、GitHub Pages で公開しています。

- 公開 URL: https://pancaaake.github.io/blog/
- `main` ブランチに push すると、GitHub Actions がビルドして自動で公開します。

## 記事を書く

`src/content/posts/` に `.md` ファイルを置きます。ファイル名がそのまま URL になります（`2026-10-25-hello.md` → `/blog/posts/2026-10-25-hello/`）。英数字とハイフンのファイル名がおすすめです。

```markdown
---
title: 記事のタイトル
date: 2026-10-25
description: 一覧に表示する概要（省略可）
tags: [野球, メモ]        # 省略可
draft: true              # 下書き。公開サイトには出ない（省略可）
glossary: false          # この記事では用語のツールチップ化をしない（省略可）
---

本文を書く。
```

> リポジトリは公開されているので、`draft: true` の記事も GitHub 上では誰でも読めます。人に見せたくない書きかけは、リポジトリの外で書いてください。

## 技術記事を書く

`src/content/tech/` に `.md` ファイルを置きます。書き方（frontmatter）は日記と同じで、URL は `/blog/tech/<ファイル名>/` になります。日記と技術の記事は、まとめて RSS に配信されます。

コードブロックは言語名を付けると色分けされます（ライト／ダークモードそれぞれの配色）。

````markdown
```ts
const res = await fetch('https://example.com/api');
```
````

## ゲームの攻略・メモを書く

1タイトルにつき1フォルダを `src/content/games/` に作ります。フォルダ名がそのまま URL になります（英数字とハイフンがおすすめ）。

```
src/content/games/
└── zelda-totk/
    ├── index.md        ← タイトルの情報 → /blog/games/zelda-totk/
    ├── chapter-1.md    ← 攻略メモ       → /blog/games/zelda-totk/chapter-1/
    └── memo.md
```

`index.md`（タイトルの情報。本文は概要やプレイ状況など）:

```markdown
---
title: ゼルダの伝説 ティアーズ オブ ザ キングダム
reading: ぜるだのでんせつ   # 一覧の並び順に使う（省略可）
platforms: [Switch]          # 省略可
description: 一覧に表示する概要（省略可）
draft: true                  # タイトルごと非公開にする（省略可）
---
```

攻略メモ（`index.md` 以外の `.md`）:

```markdown
---
title: 第1章の攻略
order: 1             # 一覧の並び順。小さいほど上（省略時は後ろに並ぶ）
date: 2026-10-26     # 省略可
updated: 2026-10-30  # 省略可
tags: [攻略]         # 省略可
draft: true          # 省略可
---
```

## 固定ページを作る

日付のない常設ページは `src/content/pages/` に置きます。ファイル名がそのまま URL になり（`map.md` → `/blog/map/`）、記事一覧や RSS には出ません。

```markdown
---
title: ガイドマップ
nav: マップ        # 指定するとヘッダーのメニューに表示される（省略可）
navOrder: 10       # メニューの並び順。小さいほど左（省略可）
---
```

## 用語を登録する（自動ツールチップ）

`src/content/glossary/` に `.md` ファイルを1つ置くと、全記事の本文でその用語に点線の下線が付き、マウスを乗せるかタップすると説明が表示されます。

```markdown
---
term: 防御率
reading: ぼうぎょりつ   # 用語集ページの並び順に使う（省略可）
aliases: [ERA]          # 別の書き方（省略可）
category: 野球          # 用語集ページで分類ごとに見出しを分ける（省略時は「その他」）
---
投手が9イニングあたりに許した自責点の平均。
```

プログラミング用語の例:

```markdown
---
term: JavaScript
category: プログラミング
aliases: [JS]
---
Web ブラウザで動くプログラミング言語。
```

- 本文がツールチップの説明になります（`description:` を書けばそちらが優先）。
- 1つの記事の中では、各用語の最初の1回だけ変換されます。
- 長い用語が優先されます（「長打率」は「打率」ではなく「長打率」として扱われる）。
- 見出し・リンク・コード（`` `インライン` `` とコードブロック）の中は変換されません。英字の用語は単語の途中では一致しません（`API` は `APIs` に反応しない）。
- 英字の大文字・小文字は区別します（`Go` が英文中の `go` に反応しないように）。表記ゆれは `aliases` に書いてください（例: `aliases: [javascript, JS]`）。
- `C++` や `Node.js` のように記号を含む用語も登録できます。
- 登録した用語は `/blog/glossary/` に一覧で表示されます。

## 地図を埋め込む（Google マイマップ）

1. マイマップの共有設定を「リンクを知っている全員」にする（地図は誰でも見られる状態になります）
2. ︙ メニュー →「自分のサイトに埋め込む」で表示される URL の `mid=` の値をコピー
3. 記事に次のように書く

```markdown
::mymap{id="1AbCdEfGhIjKlMn" title="行ったお店の地図"}
```

`size="large"` を付けると、本文より広い幅（最大 72rem）で、高さが画面の約75%の大きな地図になります。

```markdown
::mymap{id="1AbCdEfGhIjKlMn" title="行ったお店の地図" size="large"}
```

## PR（アフィリエイト）枠

紹介リンクは次のように囲むと、自動で「PR」の表示が付きます（ステルスマーケティング規制への対応）。

```markdown
:::pr
[紹介する商品](https://example.com/...) の説明。
:::
```

## 広告（Google AdSense）

`src/site.config.mjs` の `adsense` を設定すると、記事の下に広告が表示され、プライバシーポリシーに広告の項目が追加されます。AdSense は `github.io` のサブドメインでは申請できないため、独自ドメインの設定が先に必要です。

## 独自ドメインにするとき

1. `src/site.config.mjs` の `url` をドメインに、`base` を `'/'` に変える
2. `public/CNAME` にドメイン名だけを書いたファイルを置く
3. リポジトリの Settings → Pages → Custom domain にドメインを設定し、DNS を設定する

## 手元で動かす

Node.js 22.23.4 以上が必要です。

```bash
npm ci
npm run dev        # http://localhost:4321/blog/ で確認（下書きも表示される）
npm run build      # dist/ に公開用のファイルを出力
```

開発サーバーの起動中に用語を追加・編集・削除すると、サーバーが自動で再起動して全記事に反映されます。

## セキュリティ

- 出力は静的な HTML のみで、サーバー側のプログラムやデータベースはありません。
- `.npmrc` で依存パッケージのバージョンを固定し、インストール時のスクリプト実行を禁止しています。
- GitHub Actions は公式のものだけを、コミットの SHA で固定して使っています。
- Dependabot が依存パッケージと Actions の更新を週1回知らせます。
