// remark-directive の書き方（::name{...} / :::name）を HTML に変換する remark プラグイン。
//
//   ::mymap{id="地図のID" title="地図の説明"}   Google マイマップを埋め込む
//
//   :::pr                                       広告・アフィリエイトの枠（「PR」表示付き）
//   ここに紹介文やリンクを書く
//   :::

const MYMAP_ID = /^[A-Za-z0-9_-]+$/;

function element(tagName, properties, children = []) {
  return { type: 'embedElement', data: { hName: tagName, hProperties: properties }, children };
}

function mymap(node, file) {
  const { id, title } = node.attributes ?? {};
  if (!id || !MYMAP_ID.test(id)) {
    file.fail('::mymap には id="..." で地図のID（URL の mid= の値）を指定してください', node);
  }
  const label = title || 'Google マイマップ';
  node.data = { hName: 'div', hProperties: { className: ['embed', 'embed--map'] } };
  node.children = [
    element('iframe', {
      src: `https://www.google.com/maps/d/embed?mid=${encodeURIComponent(id)}`,
      title: label,
      loading: 'lazy',
      allowFullScreen: true,
    }),
  ];
}

function pr(node) {
  node.data = {
    hName: 'aside',
    hProperties: { className: ['pr'], ariaLabel: '広告' },
  };
  node.children = [
    element('p', { className: ['pr__label'] }, [{ type: 'text', value: 'PR' }]),
    ...node.children,
  ];
}

/** 未対応のディレクティブを元の文字に戻す（"Note:abc" の ":abc" が消えないように） */
function restore(node) {
  const children = node.children ?? [];
  if (node.type === 'textDirective') {
    return [{ type: 'text', value: ':' + node.name }, ...children];
  }
  if (node.type === 'leafDirective') {
    return [{ type: 'paragraph', children: [{ type: 'text', value: '::' + node.name }, ...children] }];
  }
  return [{ type: 'paragraph', children: [{ type: 'text', value: ':::' + node.name }] }, ...children];
}

export function remarkEmbeds() {
  return (tree, file) => {
    function walk(parent) {
      if (!parent.children) return;
      const next = [];
      for (const child of parent.children) {
        if (child.type === 'leafDirective' && child.name === 'mymap') {
          mymap(child, file);
        } else if (child.type === 'containerDirective' && child.name === 'pr') {
          pr(child);
          walk(child);
        } else if (child.type === 'textDirective' || child.type === 'leafDirective' || child.type === 'containerDirective') {
          walk(child);
          next.push(...restore(child));
          continue;
        } else {
          walk(child);
        }
        next.push(child);
      }
      parent.children = next;
    }
    walk(tree);
  };
}
