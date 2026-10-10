import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { createRoomServer, connectToRoom } from './transport.js';
import { newSession, reduceGame, uid } from './model.js';
import { starterBoard } from './starter.js';

// Deterministic PeerJS-compatible transports exercise the actual app protocol,
// including authorization and message ordering, without depending on a public service.
class FakePeer extends EventEmitter {
  static peers = new Map();
  constructor(id) {
    super(); this.id = id || uid(); this.destroyed = false; this.connections = [];
    FakePeer.peers.set(this.id, this);
    queueMicrotask(() => { if (!this.destroyed) this.emit('open', this.id); });
  }
  connect(id) {
    const target = FakePeer.peers.get(id);
    const a = new EventEmitter(), b = new EventEmitter();
    a.connectionId = b.connectionId = uid(); a.peer = id; b.peer = this.id;
    a.send = message => queueMicrotask(() => { if (b.open) b.emit('data', structuredClone(message)); });
    b.send = message => queueMicrotask(() => { if (a.open) a.emit('data', structuredClone(message)); });
    a.close = b.close = () => { a.open = b.open = false; a.emit('close'); b.emit('close'); };
    this.connections.push(a); target?.connections.push(b);
    queueMicrotask(() => {
      if (!target) { this.emit('error', { type: 'peer-unavailable' }); return; }
      a.open = b.open = true; target.emit('connection', b); a.emit('open');
    });
    return a;
  }
  destroy() { this.destroyed = true; for (const c of this.connections) c.close(); FakePeer.peers.delete(this.id); }
  reconnect() { this.emit('open', this.id); }
}
class FakeChannel {
  static channels = new Map();
  constructor(room) {
    this.room = room;
    if (!FakeChannel.channels.has(room)) FakeChannel.channels.set(room, new Set());
    FakeChannel.channels.get(room).add(this);
  }
  postMessage(data) { for (const target of FakeChannel.channels.get(this.room) || []) if (target !== this) queueMicrotask(() => target.onmessage?.({ data: structuredClone(data) })); }
  close() { FakeChannel.channels.get(this.room)?.delete(this); this.onmessage = null; }
}
const waitFor = async condition => {
  const deadline = Date.now() + 3000;
  while (!condition()) { if (Date.now() > deadline) throw new Error('Connection timed out'); await new Promise(resolve => setTimeout(resolve, 10)); }
};

for (const mode of ['same-browser channel', 'remote PeerJS connection']) {
  test(`${mode}: private control, audience secrecy, first buzz, scoring, and reconnect`, async t => {
    let game = newSession(starterBoard());
    const makeChannel = mode === 'same-browser channel' ? room => new FakeChannel(room) : () => null;
    let server;
    const dispatch = action => { game = reduceGame(game, action); server?.broadcast(); };
    server = createRoomServer({ getState: () => game, dispatch, onStatus() {}, makeChannel, PeerClass: FakePeer });
    t.after(() => server.dispose());
    const clients = [];
    const join = (role, key, device = uid(), name = role) => {
      const result = { state: null, player: null, status: {} };
      result.client = connectToRoom({ room: game.room, role, key, name, device, makeChannel, PeerClass: FakePeer,
        onState(state, player) { result.state = state; result.player = player; }, onStatus(patch) { Object.assign(result.status, patch); } });
      clients.push(result.client);
      return result;
    };
    t.after(() => clients.forEach(client => client.dispose()));
    const host = join('control', game.key);
    const wrong = join('control', 'NOTTHEKEY');
    const display = join('display');
    const deviceA = uid();
    const a = join('buzzer', null, deviceA, 'Player A');
    const b = join('buzzer', null, uid(), 'Player B');
    await waitFor(() => host.state && display.state && a.player && b.player && wrong.status.error);
    assert.equal(wrong.state, null);
    assert.equal(game.players.length, 2);
    assert.equal(host.state.board.categories[0].clues[0].answer, 'Paris');
    assert.equal(host.state.key, undefined);
    assert.equal(display.state.board, undefined);
    assert.ok(!JSON.stringify(display.state).includes('Paris'));

    // An audience connection cannot execute host commands, even if it sends one.
    display.client.command({ type: 'SCORE', playerId: a.player, amount: 99999 });
    await new Promise(resolve => setTimeout(resolve, 25));
    assert.equal(game.players[0].score, 0);

    const clue = game.board.categories[0].clues[0];
    host.client.command({ type: 'SELECT', id: clue.id });
    await waitFor(() => a.state.active === clue.id);
    assert.ok(!JSON.stringify(a.state).includes('Paris'));
    host.client.command({ type: 'OPEN_BUZZERS' });
    await waitFor(() => a.state.buzzOpen && b.state.buzzOpen);
    a.client.buzz(a.state.buzzEpoch);
    b.client.buzz(b.state.buzzEpoch);
    await waitFor(() => host.state.winner);
    assert.equal(game.winner, a.player);
    assert.equal(game.buzzOpen, false);
    host.client.command({ type: 'JUDGE', playerId: a.player, correct: true });
    await waitFor(() => display.state.revealed);
    assert.equal(display.state.clue.answer, 'Paris');
    assert.equal(game.players.find(player => player.id === a.player).score, 200);

    a.client.dispose();
    const rejoined = join('buzzer', null, deviceA, 'Player A');
    await waitFor(() => rejoined.player);
    assert.equal(rejoined.player, a.player);
    assert.equal(game.players.length, 2);
    assert.equal(rejoined.state.players.find(player => player.id === a.player).score, 200);
    host.client.command({ type: 'UNDO' });
    await waitFor(() => rejoined.state.players.find(player => player.id === a.player).score === 0);
    assert.equal(game.revealed, false);
  });
}

test('repeated controller commands are idempotent and buzzer identities cannot be spoofed', t => {
  let game = newSession(starterBoard(), ['Manual player']);
  const server = createRoomServer({ getState: () => game, dispatch: action => { game = reduceGame(game, action); }, onStatus() {}, makeChannel: () => null, PeerClass: FakePeer });
  t.after(() => server.dispose());
  const sink = () => {};
  server.receive('host', { type: 'hello', role: 'control', key: game.key }, sink);
  const message = { type: 'command', id: uid(), action: { type: 'SCORE', playerId: game.players[0].id, amount: 500 } };
  server.receive('host', message, sink);
  server.receive('host', message, sink);
  assert.equal(game.players[0].score, 500);
  game = reduceGame(game, { type: 'SELECT', id: game.board.categories[0].clues[0].id });
  game = reduceGame(game, { type: 'OPEN_BUZZERS' });
  server.receive('display', { type: 'hello', role: 'display' }, sink);
  server.receive('display', { type: 'buzz', id: uid(), playerId: game.players[0].id, epoch: game.buzzEpoch }, sink);
  assert.equal(game.winner, null);
});
