import test from 'node:test';
import assert from 'node:assert/strict';
import { allClues, clueValue, MAX_PLAYERS, newBoard, newSession, normalizeBoard, publicState, readyClues, reduceGame, uid } from './model.js';
import { starterBoard } from './starter.js';
import { importBoard, readBoards, readSession, saveBoards, saveSession } from './storage.js';

const setup = () => newSession(starterBoard(), ['Idrees', 'Abram']);
const select = game => reduceGame(game, { type: 'SELECT', id: game.board.categories[0].clues[0].id });

test('new boards have five categories, five clues, 200–1000 values, and unique IDs', () => {
  const board = newBoard();
  assert.equal(board.categories.length, 5);
  assert.equal(allClues(board).length, 25);
  for (const category of board.categories) assert.deepEqual(category.clues.map(c => c.value), [200, 400, 600, 800, 1000]);
  assert.equal(new Set(allClues(board).map(c => c.id)).size, 25);
  assert.equal(readyClues(board).length, 0);
});

test('only completed unused clues can be selected; active clue cannot be overwritten', () => {
  const empty = newSession(newBoard());
  assert.equal(select(empty), empty);
  let game = setup();
  const id = game.board.categories[0].clues[0].id;
  game = select(game);
  assert.equal(game.active, id);
  assert.equal(reduceGame(game, { type: 'SELECT', id: game.board.categories[0].clues[1].id }), game);
  game = reduceGame(game, { type: 'RETURN' });
  assert.ok(game.used.includes(id));
  assert.equal(reduceGame(game, { type: 'SELECT', id }), game);
});

test('return without using a clue keeps it playable; sessions do not mutate saved boards', () => {
  const board = starterBoard();
  const original = structuredClone(board);
  let game = select(newSession(board));
  game = reduceGame(game, { type: 'RETURN', keep: true });
  assert.equal(game.used.length, 0);
  assert.ok(select(game).active);
  assert.deepEqual(board, original);
});

test('public audience state omits answer keys, notes, private credentials and undo history', () => {
  let game = setup();
  const clue = game.board.categories[0].clues[0];
  clue.notes = 'PRIVATE HOST NOTE';
  game = select(game);
  let audience = publicState(game);
  assert.equal(audience.clue.question, clue.question);
  for (const secret of [game.key, clue.answer, clue.notes, game.board.categories[1].clues[0].question]) assert.ok(!JSON.stringify(audience).includes(secret));
  assert.equal(audience.history, undefined);
  assert.equal(audience.seats, undefined);
  game = reduceGame(game, { type: 'REVEAL' });
  audience = publicState(game);
  assert.equal(audience.clue.answer, clue.answer);
  assert.ok(!JSON.stringify(audience).includes(clue.notes));
});

test('first received buzz wins; later, duplicate, stale and unidentified buzzes are ignored', () => {
  let game = select(setup());
  const [a, b] = game.players;
  assert.equal(reduceGame(game, { type: 'BUZZ', playerId: a.id, epoch: game.buzzEpoch }), game);
  game = reduceGame(game, { type: 'OPEN_BUZZERS' });
  assert.equal(reduceGame(game, { type: 'BUZZ', playerId: a.id, epoch: game.buzzEpoch - 1 }), game);
  assert.equal(reduceGame(game, { type: 'BUZZ', playerId: 'intruder', epoch: game.buzzEpoch }), game);
  game = reduceGame(game, { type: 'BUZZ', playerId: a.id, epoch: game.buzzEpoch });
  assert.equal(game.winner, a.id);
  assert.equal(game.buzzOpen, false);
  assert.equal(reduceGame(game, { type: 'BUZZ', playerId: b.id, epoch: game.buzzEpoch }), game);
});

test('incorrect answers subtract once, reopen for others, and keep that player locked out', () => {
  let game = select(setup());
  const [a, b] = game.players;
  game = reduceGame(game, { type: 'OPEN_BUZZERS' });
  game = reduceGame(game, { type: 'BUZZ', playerId: a.id, epoch: game.buzzEpoch });
  game = reduceGame(game, { type: 'JUDGE', playerId: a.id, correct: false });
  assert.equal(game.players[0].score, -200);
  assert.ok(game.buzzOpen);
  assert.equal(reduceGame(game, { type: 'JUDGE', playerId: a.id, correct: false }), game);
  assert.equal(reduceGame(game, { type: 'BUZZ', playerId: a.id, epoch: game.buzzEpoch }), game);
  game = reduceGame(game, { type: 'BUZZ', playerId: b.id, epoch: game.buzzEpoch });
  assert.equal(game.winner, b.id);
  game = reduceGame(game, { type: 'JUDGE', playerId: b.id, correct: true });
  assert.equal(game.players[1].score, 200);
  assert.ok(game.revealed);
  assert.equal(reduceGame(game, { type: 'JUDGE', playerId: b.id, correct: true }), game);
});

test('custom values, double points, and the no-deduction setting drive scoring', () => {
  let game = setup();
  const clue = game.board.categories[0].clues[0];
  clue.value = 750; clue.double = true;
  assert.equal(clueValue(clue), 1500);
  game.board.settings.deductWrong = false;
  game = select(game);
  game = reduceGame(game, { type: 'JUDGE', playerId: game.players[0].id, correct: false });
  assert.equal(game.players[0].score, 0);
  game = reduceGame(game, { type: 'JUDGE', playerId: game.players[1].id, correct: true });
  assert.equal(game.players[1].score, 1500);
});

test('undo restores scores and clues without removing players who joined later', () => {
  let game = select(setup());
  game = reduceGame(game, { type: 'JUDGE', playerId: game.players[0].id, correct: true });
  game = reduceGame(game, { type: 'JOIN_PLAYER', deviceId: uid(), name: 'Late arrival' });
  game = reduceGame(game, { type: 'UNDO' });
  assert.equal(game.players[0].score, 0);
  assert.equal(game.players.length, 3);
  assert.equal(game.players[2].name, 'Late arrival');
  assert.equal(game.revealed, false);
  assert.equal(game.buzzOpen, false);
});

test('timer pause/resume and expiry lock buzzers; buzzer arrival at deadline is rejected', () => {
  let game = select(setup());
  game = reduceGame(game, { type: 'OPEN_BUZZERS' }, 1000);
  game = reduceGame(game, { type: 'TIMER' }, 1000);
  assert.equal(game.timerEnd, 31000);
  game = reduceGame(game, { type: 'TIMER' }, 6000);
  assert.equal(game.timerRemaining, 25000);
  game = reduceGame(game, { type: 'TIMER' }, 10000);
  assert.equal(game.timerEnd, 35000);
  assert.equal(reduceGame(game, { type: 'TIMER_EXPIRED' }, 34999), game);
  assert.equal(reduceGame(game, { type: 'BUZZ', playerId: game.players[0].id, epoch: game.buzzEpoch }, 35000), game);
  game = reduceGame(game, { type: 'TIMER_EXPIRED' }, 35000);
  assert.equal(game.timerRemaining, 0);
  assert.equal(game.buzzOpen, false);
});

test('rejoining a device preserves its player, score and removal status', () => {
  const deviceId = uid();
  let game = reduceGame(setup(), { type: 'JOIN_PLAYER', deviceId, name: 'Phone player' });
  const id = game.seats[deviceId];
  game = reduceGame(game, { type: 'SCORE', playerId: id, amount: 500 });
  assert.equal(reduceGame(game, { type: 'JOIN_PLAYER', deviceId, name: 'Different name' }), game);
  assert.equal(game.players.find(player => player.id === id).score, 500);
  game = reduceGame(game, { type: 'REMOVE_PLAYER', playerId: id });
  assert.equal(reduceGame(game, { type: 'JOIN_PLAYER', deviceId, name: 'Again' }), game);
  game = reduceGame(game, { type: 'UNDO' });
  assert.equal(game.players.find(player => player.id === id).score, 500);
});

test('player limits and bad score inputs are enforced', () => {
  let game = setup();
  for (let i = 0; i < 40; i++) game = reduceGame(game, { type: 'ADD_PLAYER', name: `Player ${i}` });
  assert.equal(game.players.length, MAX_PLAYERS);
  for (const amount of [NaN, Infinity, 'invalid', 1000001]) assert.equal(reduceGame(game, { type: 'SCORE', playerId: game.players[0].id, amount }), game);
});

test('finish closes the game; undo permits an encore', () => {
  let game = reduceGame(select(setup()), { type: 'FINISH' });
  assert.equal(game.ended, true);
  assert.equal(game.active, null);
  assert.equal(select(game), game);
  game = reduceGame(game, { type: 'UNDO' });
  assert.equal(game.ended, false);
});

test('import validates bounds, strips unexpected fields, keeps plain text, and regenerates identities', async () => {
  const board = starterBoard();
  board.secret = 'should not be carried';
  board.categories[0].clues[0].question = '<script>alert(1)</script>';
  const copied = normalizeBoard(board);
  assert.notEqual(copied.id, board.id);
  assert.notEqual(copied.categories[0].clues[0].id, board.categories[0].clues[0].id);
  assert.equal(copied.secret, undefined);
  assert.equal(copied.categories[0].clues[0].question, '<script>alert(1)</script>');
  assert.throws(() => normalizeBoard({ categories: [] }));
  assert.throws(() => normalizeBoard({ categories: Array(13).fill(board.categories[0]) }));
  assert.throws(() => normalizeBoard({ categories: [{ clues: Array(21).fill({}) }] }));
  const file = new Blob([JSON.stringify({ version: 1, board })]);
  assert.equal((await importBoard(file)).title, board.title);
  await assert.rejects(importBoard(new Blob(['not json'])));
  await assert.rejects(importBoard(new Blob([JSON.stringify({ version: 99, board })])));
});

test('browser library and game progress round-trip; failed storage never silently succeeds', () => {
  const values = new Map();
  globalThis.localStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  const board = starterBoard();
  saveBoards([board]); assert.deepEqual(readBoards(), [board]);
  let game = select(newSession(board, ['Idrees']));
  game = reduceGame(game, { type: 'JUDGE', playerId: game.players[0].id, correct: true });
  saveSession(game); assert.deepEqual(readSession(game.room), game);
  localStorage.setItem = () => { throw new Error('Quota exceeded'); };
  assert.throws(() => saveBoards([board]), /storage is full/);
  assert.throws(() => saveSession(game));
  values.set('idrees-jeopardy-library-v1', '{bad json');
  assert.throws(() => readBoards());
  delete globalThis.localStorage;
});
