import { getCollection, type CollectionEntry } from 'astro:content';

const visible = ({ data }: { data: { draft: boolean } }) => import.meta.env.DEV || !data.draft;

/** 公開するゲームのタイトルを読み仮名順に返す（draft: true は本番ビルドから除外） */
export async function getGames() {
  const games = await getCollection('games', visible);
  const key = (game: CollectionEntry<'games'>) => game.data.reading ?? game.data.title;
  return games.sort((a, b) => key(a).localeCompare(key(b), 'ja'));
}

/** タイトルのフォルダ名（"zelda/boss" の "zelda"） */
export function gameIdOf(note: CollectionEntry<'gameNotes'>) {
  return note.id.split('/')[0];
}

/** メモのファイル名（"zelda/boss" の "boss"） */
export function noteSlugOf(note: CollectionEntry<'gameNotes'>) {
  return note.id.split('/').slice(1).join('/');
}

/** 公開するタイトルの攻略メモを order 順に返す。gameId を省略すると全タイトル分 */
export async function getGameNotes(gameId?: string) {
  const gameIds = new Set((await getGames()).map((game) => game.id));
  const notes = await getCollection(
    'gameNotes',
    (note) => visible(note) && gameIds.has(gameIdOf(note)) && (!gameId || gameIdOf(note) === gameId),
  );
  return notes.sort((a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title, 'ja'));
}

/** メモの最終更新日（updated → date の順に使う） */
export function noteDate(note: CollectionEntry<'gameNotes'>) {
  return note.data.updated ?? note.data.date;
}
