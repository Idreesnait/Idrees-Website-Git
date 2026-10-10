import { normalizeBoard } from './model.js';
const LIBRARY = 'idrees-jeopardy-library-v1';
const SESSION = 'idrees-jeopardy-session-v1:';
export function readBoards() {
  const raw = localStorage.getItem(LIBRARY);
  if (!raw) return [];
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) throw new Error('Your saved library could not be read. Export a backup before clearing browser data.');
  for (const board of data) {
    normalizeBoard(board);
    if (typeof board.id !== 'string' || !board.settings || !board.categories.every(cat => typeof cat.id === 'string' && cat.clues.every(clue => typeof clue.id === 'string' && typeof clue.question === 'string' && typeof clue.answer === 'string'))) throw new Error('Invalid saved board.');
  }
  return data;
}
export function saveBoards(boards) {
  try { localStorage.setItem(LIBRARY, JSON.stringify(boards)); }
  catch { throw new Error('Browser storage is full or unavailable. Export this game now to keep your changes.'); }
}
export function readSession(room) {
  try { const game = JSON.parse(localStorage.getItem(SESSION + room)); return game?.version === 1 ? game : null; }
  catch { return null; }
}
export function saveSession(game) {
  // The answer key stays on the host computer. A refresh restores the same room.
  localStorage.setItem(SESSION + game.room, JSON.stringify(game));
  localStorage.setItem('idrees-jeopardy-last-room', game.room);
}
export function exportBoard(board) {
  const blob = new Blob([JSON.stringify({ format: 'idrees-jeopardy', version: 1, board }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${board.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'jeopardy'}.json`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function importBoard(file) {
  if (file.size > 2 * 1024 * 1024) throw new Error('Choose a game file smaller than 2 MB.');
  let data;
  try { data = JSON.parse(await file.text()); } catch { throw new Error('This is not a valid JSON game file.'); }
  if (data.version && data.version !== 1) throw new Error('This game uses an unsupported file version.');
  return normalizeBoard(data.board || data);
}
