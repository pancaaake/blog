// サイト全体の設定。独自ドメインに切り替えるときは url と base を変える
// （例: url: 'https://example.com', base: '/'）。
export const SITE = {
  title: 'pancake blog',
  description: '日々のメモと記録',
  author: 'pancake',
  lang: 'ja',
  url: 'https://pancaaake.github.io',
  base: '/blog',

  // Google AdSense。審査に通ったら enabled を true にして client を入れる
  adsense: {
    enabled: false,
    client: '', // 例: 'ca-pub-0000000000000000'
    slot: '', // 記事下の広告ユニットID
  },
};
