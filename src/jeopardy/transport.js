import Peer from 'peerjs';
import { publicState, cleanText, uid } from './model.js';

const peerId = room => `idrees-jeopardy-v1-${room}`;
const channelName = room => `idrees-jeopardy-v1-${room}`;
const commands = new Set(['SELECT', 'REVEAL', 'RETURN', 'OPEN_BUZZERS', 'CLOSE_BUZZERS', 'JUDGE', 'SCORE', 'ADD_PLAYER', 'REMOVE_PLAYER', 'RENAME_PLAYER', 'TIMER', 'FINISH', 'UNDO', 'TOGGLE_JOIN']);
const channel = room => typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(channelName(room)) : null;
const peerOptions = { debug: 0 };
export function deviceId() {
  try {
    let value = sessionStorage.getItem('jeopardy-device-id');
    if (!value) { value = uid(); sessionStorage.setItem('jeopardy-device-id', value); }
    return value;
  } catch { return uid(); }
}
function sendSafely(send, message) { try { send(message); } catch { /* A closed device can reconnect. */ } }

// Shared protocol across same-computer BroadcastChannel and cross-device WebRTC.
// Buzzes are ordered on arrival here, never by untrusted player timestamps.
export function createRoomServer({ getState, dispatch, onStatus, PeerClass = Peer, makeChannel = channel }) {
  const clients = new Map();
  const bc = makeChannel(getState().room);
  let disposed = false;
  let failures = [];
  let remoteReady = false;
  const notifyCount = () => onStatus({ remoteReady, connections: [...clients.values()].filter(c => c.authorized && Date.now() - c.seen < 20000).length });
  function snapshot(client) {
    const game = getState();
    const { key: privateKey, history, ...controllerState } = game;
    const state = client.role === 'control' ? { ...controllerState, history: [], canUndo: history.length > 0 } : publicState(game);
    sendSafely(client.send, { type: 'state', state, playerId: client.playerId, sentAt: Date.now() });
  }
  function broadcast() { for (const client of clients.values()) if (client.authorized) snapshot(client); }
  function receive(id, message, send) {
    if (disposed || !message || typeof message !== 'object') return;
    let client = clients.get(id);
    if (!client) {
      if (clients.size >= 80) return;
      client = { send, authorized: false, seen: Date.now(), recent: [], ids: new Set() };
      clients.set(id, client);
    }
    client.seen = Date.now();
    if (message.type === 'hello') {
      const role = ['control', 'display', 'buzzer'].includes(message.role) ? message.role : null;
      if (!role) return;
      if (role === 'control') {
        failures = failures.filter(time => time > Date.now() - 60000);
        if (failures.length >= 12 || message.key !== getState().key) {
          failures.push(Date.now());
          sendSafely(send, { type: 'error', message: 'That private host key is incorrect. Check the key on the computer and try again.' });
          return;
        }
      }
      if (role === 'buzzer') {
        if (!/^[a-zA-Z0-9-]{20,60}$/.test(message.deviceId || '') || !cleanText(message.name, 32)) return;
        dispatch({ type: 'JOIN_PLAYER', deviceId: message.deviceId, name: message.name });
        client.playerId = getState().seats[message.deviceId];
        if (!client.playerId || !getState().players.some(p => p.id === client.playerId)) {
          sendSafely(send, { type: 'error', message: 'The room is full, has ended, or the host removed you.' });
          return;
        }
      }
      client.role = role;
      client.authorized = true;
      snapshot(client);
      broadcast();
      notifyCount();
      return;
    }
    if (!client.authorized) return;
    if (message.type === 'ping') { sendSafely(send, { type: 'pong', at: Date.now() }); return; }
    client.recent = client.recent.filter(time => time > Date.now() - 1000);
    if (client.recent.length >= 20) return;
    client.recent.push(Date.now());
    if (!message.id || typeof message.id !== 'string' || client.ids.has(message.id)) return;
    client.ids.add(message.id);
    if (client.ids.size > 200) client.ids.delete(client.ids.values().next().value);
    if (message.type === 'command' && client.role === 'control' && commands.has(message.action?.type)) {
      dispatch(message.action);
    } else if (message.type === 'buzz' && client.role === 'buzzer') {
      dispatch({ type: 'BUZZ', playerId: client.playerId, epoch: message.epoch });
    }
    broadcast(); // Also acknowledges rejected/duplicate buzzes with the authoritative winner.
  }
  if (bc) bc.onmessage = ({ data }) => {
    if (data?.to !== 'host' || typeof data.from !== 'string') return;
    receive(`local:${data.from}`, data.message, message => bc.postMessage({ to: data.from, from: 'host', message }));
  };
  const peer = new PeerClass(peerId(getState().room), peerOptions);
  peer.on('open', () => { remoteReady = true; onStatus({ remoteReady: true, error: '' }); notifyCount(); });
  peer.on('connection', connection => {
    const id = `remote:${connection.connectionId || connection.peer}:${uid()}`;
    connection.on('data', message => receive(id, message, payload => { if (connection.open) connection.send(payload); }));
    connection.on('close', () => { clients.delete(id); notifyCount(); });
    connection.on('error', () => { clients.delete(id); notifyCount(); });
  });
  peer.on('disconnected', () => {
    remoteReady = false;
    onStatus({ remoteReady: false, error: 'Room service reconnecting. Existing device connections may still work.' });
    if (!disposed && !peer.destroyed) { try { peer.reconnect(); } catch { /* Retry button can rebuild it. */ } }
  });
  peer.on('error', error => {
    remoteReady = false;
    onStatus({ remoteReady: false, error: error.type === 'unavailable-id'
      ? 'This room is already open in another tab. Use that tab, or start a new game.'
      : 'Phone connections are unavailable right now. Try the same Wi-Fi and reconnect. You can still play on this computer.' });
  });
  const bootTimeout = setTimeout(() => {
    if (!remoteReady) onStatus({ remoteReady: false, error: 'The room service is taking too long. Reconnect, or play on this computer.' });
  }, 15000);
  const upkeep = setInterval(() => {
    for (const [id, client] of clients) if (Date.now() - client.seen > 25000) clients.delete(id);
    notifyCount();
  }, 10000);
  return { broadcast, dispose() { disposed = true; clearTimeout(bootTimeout); clearInterval(upkeep); bc?.close(); peer.destroy(); clients.clear(); }, receive };
}

export function connectToRoom({ room, role, key, name, device, onState, onStatus, PeerClass = Peer, makeChannel = channel }) {
  const bc = makeChannel(room);
  const id = uid();
  let peer, connection, local = false, disposed = false, connected = false, lastSeen = Date.now(), lastPing = Date.now();
  const hello = { type: 'hello', role, key, name, deviceId: device };
  const receive = message => {
    if (disposed || !message) return;
    lastSeen = Date.now();
    if (message.type === 'state') {
      connected = true;
      onStatus({ connected: true, error: '', latency: Math.max(0, Date.now() - lastPing) });
      onState(message.state, message.playerId, message.sentAt);
    } else if (message.type === 'pong') {
      onStatus({ connected: true, latency: Date.now() - lastPing });
    } else if (message.type === 'error') {
      connected = false;
      onStatus({ connected: false, error: message.message });
    }
  };
  const send = message => {
    if (disposed) return false;
    if (local && bc) { bc.postMessage({ to: 'host', from: id, message }); return true; }
    if (connection?.open) { connection.send(message); return true; }
    return false;
  };
  if (bc) {
    bc.onmessage = ({ data }) => {
      if (data?.to !== id || data.from !== 'host') return;
      if (!local) { local = true; peer?.destroy(); }
      receive(data.message);
    };
    bc.postMessage({ to: 'host', from: id, message: hello });
  }
  const remoteTimer = setTimeout(() => {
    if (local || disposed) return;
    peer = new PeerClass(undefined, peerOptions);
    peer.on('open', () => {
      if (local || disposed) return;
      // Binary mode chunks large edited boards instead of exceeding a data-channel message limit.
      connection = peer.connect(peerId(room), { reliable: true, serialization: 'binary' });
      connection.on('open', () => { connection.send(hello); });
      connection.on('data', receive);
      connection.on('close', () => { if (!disposed && !local) { connected = false; onStatus({ connected: false, error: 'Connection lost. Keep the host computer awake, then reconnect.' }); } });
      connection.on('error', () => { if (!disposed && !local) { connected = false; onStatus({ connected: false, error: 'Could not connect. Try the same Wi-Fi as the host, then reconnect.' }); } });
    });
    peer.on('error', () => { if (!disposed && !local) { connected = false; onStatus({ connected: false, error: 'Room not reachable. Check the room code and keep the host page open. Try the same Wi-Fi.' }); } });
  }, 400);
  const heartbeat = setInterval(() => {
    if (disposed) return;
    if (Date.now() - lastSeen > 14000) { connected = false; onStatus({ connected: false, error: 'Host not responding. Keep the host page open and reconnect.' }); }
    lastPing = Date.now();
    send({ type: 'ping' });
  }, 4000);
  return {
    command(action) { return connected && send({ type: 'command', action, id: uid() }); },
    buzz(epoch) { return connected && send({ type: 'buzz', epoch, id: uid() }); },
    dispose() { disposed = true; clearTimeout(remoteTimer); clearInterval(heartbeat); bc?.close(); connection?.close(); peer?.destroy(); },
  };
}
