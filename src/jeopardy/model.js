// Pure game rules. The computer hosting the room is the single score/buzzer authority.
export const VERSION = 1;
export const MAX_CATEGORIES = 12;
export const MAX_CLUES = 20;
export const MAX_PLAYERS = 24;
export const COLORS = ['#bfadff', '#9be2c4', '#ffd580', '#ffa4b8', '#9bc9ff', '#e9b3ff'];
export const uid = () => crypto.randomUUID();
export const cleanText = (value, max = 120) => typeof value === 'string' ? value.trim().slice(0, max) : '';
export const points = (value) => Math.max(0, Math.min(100000, Math.round(Number(value) || 0)));
export function code(length = 6) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from(crypto.getRandomValues(new Uint8Array(length)), n => alphabet[n % alphabet.length]).join('');
}
export function newClue(value = 200) {
  return { id: uid(), value, question: '', answer: '', notes: '', double: false };
}
export function newCategory(number = 1, rows = 5) {
  return { id: uid(), name: `Category ${number}`, clues: Array.from({ length: rows }, (_, i) => newClue((i + 1) * 200)) };
}
export function newBoard() {
  return { version: VERSION, id: uid(), title: 'Untitled game', description: '', updatedAt: Date.now(),
    settings: { timerSeconds: 30, deductWrong: true, autoOpenBuzzers: false, sound: true, theme: 'violet' },
    categories: Array.from({ length: 5 }, (_, i) => newCategory(i + 1)) };
}
export function normalizeBoard(input) {
  if (!input || typeof input !== 'object' || !Array.isArray(input.categories) || !input.categories.length || input.categories.length > MAX_CATEGORIES) {
    throw new Error(`Choose a game file with 1–${MAX_CATEGORIES} categories.`);
  }
  const board = newBoard();
  board.title = cleanText(input.title) || 'Untitled game';
  board.description = cleanText(input.description, 500);
  const settings = input.settings || {};
  board.settings = { timerSeconds: Math.min(180, points(settings.timerSeconds ?? 30)),
    deductWrong: settings.deductWrong !== false, autoOpenBuzzers: settings.autoOpenBuzzers === true,
    sound: settings.sound !== false, theme: ['violet', 'blue', 'forest'].includes(settings.theme) ? settings.theme : 'violet' };
  board.categories = input.categories.map((cat, index) => {
    if (!cat || !Array.isArray(cat.clues) || !cat.clues.length || cat.clues.length > MAX_CLUES) throw new Error(`Each category needs 1–${MAX_CLUES} clues.`);
    return { id: uid(), name: cleanText(cat.name, 60) || `Category ${index + 1}`, clues: cat.clues.map(clue => {
      if (!clue || typeof clue !== 'object') throw new Error('This file contains an invalid clue.');
      return { id: uid(), value: points(clue.value), question: cleanText(clue.question, 4000),
        answer: cleanText(clue.answer, 2000), notes: cleanText(clue.notes, 2000), double: clue.double === true };
    }) };
  });
  return board;
}
export const allClues = board => board.categories.flatMap(cat => cat.clues);
export const readyClues = board => allClues(board).filter(clue => clue.question.trim() && clue.answer.trim());
export function findClue(board, id) {
  for (const category of board.categories) {
    const clue = category.clues.find(item => item.id === id);
    if (clue) return { ...clue, category: category.name };
  }
  return null;
}
export const clueValue = clue => clue ? clue.value * (clue.double ? 2 : 1) : 0;
export function newSession(board, names = []) {
  return { version: VERSION, room: code(), key: code(12), board: structuredClone(board),
    players: names.map((name, i) => ({ id: uid(), name: cleanText(name, 32) || `Player ${i + 1}`, score: 0, color: COLORS[i % COLORS.length] })),
    used: [], active: null, revealed: false, buzzOpen: false, buzzEpoch: 0, winner: null, rejected: [],
    awarded: [], timerEnd: null, timerRemaining: null, ended: false, showJoin: false, seats: {}, history: [], revision: 0 };
}
const undoable = new Set(['SELECT', 'RETURN', 'SCORE', 'JUDGE', 'ADD_PLAYER', 'REMOVE_PLAYER', 'RENAME_PLAYER', 'FINISH']);
export function reduceGame(state, action, now = Date.now()) {
  if (!state || !action || typeof action.type !== 'string') return state;
  if (action.type === 'UNDO') {
    if (!state.history.length) return state;
    const previous = state.history[state.history.length - 1];
    return { ...state, ...previous, history: state.history.slice(0, -1), revision: state.revision + 1,
      buzzOpen: false, winner: null, timerEnd: null, buzzEpoch: state.buzzEpoch + 1 };
  }
  let next = { ...state };
  const clue = findClue(state.board, state.active);
  switch (action.type) {
    case 'SELECT': {
      const selected = findClue(state.board, action.id);
      if (state.ended || state.active || !selected?.question.trim() || !selected?.answer.trim() || state.used.includes(action.id)) return state;
      next = { ...next, active: action.id, revealed: false, winner: null, rejected: [], awarded: [],
        buzzOpen: state.board.settings.autoOpenBuzzers, buzzEpoch: state.buzzEpoch + 1, timerEnd: null, timerRemaining: null, showJoin: false };
      break;
    }
    case 'REVEAL':
      if (!clue || state.revealed) return state;
      next = { ...next, revealed: true, buzzOpen: false, timerEnd: null, timerRemaining: null };
      break;
    case 'RETURN':
      if (!clue) return state;
      next = { ...next, used: action.keep ? state.used : [...new Set([...state.used, state.active])],
        active: null, revealed: false, buzzOpen: false, winner: null, rejected: [], awarded: [], timerEnd: null, timerRemaining: null };
      break;
    case 'OPEN_BUZZERS':
      if (!clue || state.revealed || state.ended) return state;
      next = { ...next, buzzOpen: true, winner: null, buzzEpoch: state.buzzEpoch + 1,
        rejected: action.reset ? [] : state.rejected };
      break;
    case 'CLOSE_BUZZERS':
      next.buzzOpen = false;
      break;
    case 'BUZZ':
      if (!clue || state.revealed || !state.buzzOpen || state.winner || (state.timerEnd && state.timerEnd <= now) || action.epoch !== state.buzzEpoch ||
        state.rejected.includes(action.playerId) || !state.players.some(player => player.id === action.playerId)) return state;
      next = { ...next, winner: action.playerId, buzzOpen: false, timerEnd: null,
        timerRemaining: state.timerEnd ? Math.max(0, state.timerEnd - now) : state.timerRemaining };
      break;
    case 'JUDGE': {
      if (!clue || !state.players.some(player => player.id === action.playerId) || state.awarded.includes(action.playerId)) return state;
      const correct = action.correct === true;
      const amount = correct ? clueValue(clue) : state.board.settings.deductWrong ? -clueValue(clue) : 0;
      next.players = state.players.map(player => player.id === action.playerId ? { ...player, score: player.score + amount } : player);
      if (correct) {
        next = { ...next, awarded: [...state.awarded, action.playerId], revealed: true, buzzOpen: false, timerEnd: null, timerRemaining: null };
      } else {
        if (state.rejected.includes(action.playerId)) return state;
        next = { ...next, rejected: [...state.rejected, action.playerId], winner: null,
          buzzOpen: !state.revealed, buzzEpoch: state.buzzEpoch + 1 };
      }
      break;
    }
    case 'SCORE': {
      const amount = Number(action.amount);
      if (!Number.isFinite(amount) || Math.abs(amount) > 1000000 || !state.players.some(player => player.id === action.playerId)) return state;
      next.players = state.players.map(player => player.id === action.playerId ? { ...player, score: player.score + Math.round(amount) } : player);
      break;
    }
    case 'JOIN_PLAYER': {
      if (state.seats[action.deviceId] || !cleanText(action.name, 32) || state.players.length >= MAX_PLAYERS || state.ended) return state;
      const id = uid();
      const player = { id, name: cleanText(action.name, 32), score: 0, color: COLORS[state.players.length % COLORS.length] };
      next = { ...next, seats: { ...state.seats, [action.deviceId]: id },
        players: [...state.players, player],
        history: state.history.map(snapshot => ({ ...snapshot, players: [...snapshot.players, player], seats: { ...snapshot.seats, [action.deviceId]: id } })) };
      break;
    }
    case 'ADD_PLAYER': {
      const name = cleanText(action.name, 32);
      if (!name || state.players.length >= MAX_PLAYERS || state.ended) return state;
      next.players = [...state.players, { id: action.id || uid(), name, score: 0, color: COLORS[state.players.length % COLORS.length] }];
      break;
    }
    case 'REMOVE_PLAYER':
      if (!state.players.some(player => player.id === action.playerId)) return state;
      next.players = state.players.filter(player => player.id !== action.playerId);
      if (state.winner === action.playerId) next.winner = null;
      break;
    case 'RENAME_PLAYER':
      if (!cleanText(action.name, 32)) return state;
      next.players = state.players.map(player => player.id === action.playerId ? { ...player, name: cleanText(action.name, 32) } : player);
      break;
    case 'TIMER': {
      if (!clue || state.revealed || !state.board.settings.timerSeconds) return state;
      if (state.timerEnd) next = { ...next, timerEnd: null, timerRemaining: Math.max(0, state.timerEnd - now) };
      else next = { ...next, timerEnd: now + (state.timerRemaining || state.board.settings.timerSeconds * 1000), timerRemaining: null };
      break;
    }
    case 'TIMER_EXPIRED':
      if (!state.timerEnd || state.timerEnd > now) return state;
      next = { ...next, timerEnd: null, timerRemaining: 0, buzzOpen: false };
      break;
    case 'FINISH':
      next = { ...next, ended: true, active: null, buzzOpen: false, timerEnd: null };
      break;
    case 'TOGGLE_JOIN':
      next.showJoin = !state.showJoin;
      break;
    default: return state;
  }
  if (undoable.has(action.type)) {
    const { history, board, key, ...snapshot } = state;
    next.history = [...history.slice(-39), snapshot];
  }
  next.revision = state.revision + 1;
  return next;
}
// Audience devices never receive the answer key, notes, private key, or undo history.
export function publicState(state) {
  const active = findClue(state.board, state.active);
  return { room: state.room, revision: state.revision, title: state.board.title, theme: state.board.settings.theme,
    players: state.players.map(({ id, name, score, color }) => ({ id, name, score, color })), used: state.used, active: state.active, revealed: state.revealed,
    buzzOpen: state.buzzOpen, buzzEpoch: state.buzzEpoch, winner: state.winner, rejected: state.rejected,
    ended: state.ended, showJoin: state.showJoin, timerEnd: state.timerEnd, timerRemaining: state.timerRemaining,
    categories: state.board.categories.map(cat => ({ id: cat.id, name: cat.name,
      clues: cat.clues.map(clue => ({ id: clue.id, value: clue.value, ready: !!(clue.question.trim() && clue.answer.trim()) })) })),
    clue: active ? { id: active.id, category: active.category, value: clueValue(active), double: active.double,
      question: active.question, ...(state.revealed ? { answer: active.answer } : {}) } : null };
}
