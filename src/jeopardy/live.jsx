import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Bell, Check, ChevronRight, Eye, EyeOff, Grid2X2, LockKeyhole, Minus, Monitor, Pause, Pencil, Play, Plus, QrCode, RefreshCw, Settings2, Smartphone, Timer as TimerIcon, Trash2, Trophy, Undo2, Users, Wifi, X } from 'lucide-react';
import { clueValue, findClue, MAX_PLAYERS, publicState, readyClues, reduceGame } from './model';
import { readSession, saveSession } from './storage';
import { connectToRoom, createRoomServer, deviceId } from './transport';
import { Button, chime, CopyLink, formatScore, fullscreen, FullscreenButton, Header, IconButton, Modal, QR, Timer, unlockAudio, useAwake } from './ui';

const roomUrl = (role, room) => `${window.location.origin}/jeopardy/${role}?room=${room}`;

export function HostPage() {
  const { room } = useParams();
  const [game, setGame] = useState(() => readSession(room));
  const gameRef = useRef(game);
  const server = useRef(null);
  const [status, setStatus] = useState({ remoteReady: false, connections: 0, error: '' });
  const [networkAttempt, setNetworkAttempt] = useState(0);
  const [storageError, setStorageError] = useState('');
  const [tv, setTv] = useState(false);
  const [pairing, setPairing] = useState(false);
  const [locked, setLocked] = useState(false);
  useAwake();
  const dispatch = useCallback(action => {
    const previous = gameRef.current;
    const next = reduceGame(previous, action);
    if (next === previous) return;
    gameRef.current = next;
    setGame(next);
    try { saveSession(next); setStorageError(''); }
    catch { setStorageError('The game is running, but progress cannot be saved. Keep this tab open.'); }
    if (next.winner && next.winner !== previous.winner && next.board.settings.sound) chime();
    server.current?.broadcast();
  }, []);
  useEffect(() => {
    if (!gameRef.current) return;
    let disposed = false;
    let cleanup;
    const start = () => {
      if (disposed) return;
      const transport = createRoomServer({ getState: () => gameRef.current, dispatch,
        onStatus: patch => { if (!disposed) setStatus(previous => ({ ...previous, ...patch })); } });
      server.current = transport;
      cleanup = () => transport.dispose();
    };
    // A second local host tab must not independently award scores or accept buzzes.
    let releaseLock;
    if (navigator.locks) navigator.locks.request(`jeopardy-host-${room}`, { ifAvailable: true }, async lock => {
      if (disposed) return;
      if (!lock) { setLocked(true); return; }
      setLocked(false);
      start();
      await new Promise(resolve => { releaseLock = resolve; });
    }).catch(() => { if (!disposed) start(); });
    else start();
    return () => { disposed = true; cleanup?.(); releaseLock?.(); server.current = null; };
  }, [room, networkAttempt, dispatch]);
  useEffect(() => {
    const timer = setInterval(() => {
      if (!server.current) return;
      const state = gameRef.current;
      if (state?.timerEnd && state.timerEnd <= Date.now()) dispatch({ type: 'TIMER_EXPIRED' });
    }, 150);
    return () => clearInterval(timer);
  }, [dispatch]);
  useEffect(() => {
    const keydown = event => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName) || document.querySelector('dialog[open]')) return;
      if (event.key === 'Escape') setTv(false);
      if (locked) return;
      const state = gameRef.current;
      if (event.code === 'Space' && state?.active) { event.preventDefault(); dispatch({ type: 'REVEAL' }); }
      if (event.key.toLowerCase() === 'b' && state?.active) dispatch({ type: 'RETURN' });
      if (event.key.toLowerCase() === 'f') fullscreen();
    };
    const leaving = event => {
      if (!gameRef.current?.ended) { event.preventDefault(); event.returnValue = ''; }
    };
    window.addEventListener('keydown', keydown);
    window.addEventListener('beforeunload', leaving);
    return () => { window.removeEventListener('keydown', keydown); window.removeEventListener('beforeunload', leaving); };
  }, [dispatch, locked]);
  if (!game) return <><Header /><main className="j-empty"><Monitor size={40} /><h1>Start this room on the host computer.</h1><p>This browser doesn’t have that game session. Use your private host link to control a game from another device.</p><div className="j-actions"><Link className="j-button" to="/jeopardy">My boards</Link><Link className="j-button j-secondary" to={`/jeopardy/control?room=${room}`}>Join as host</Link></div></main></>;
  const publicGame = publicState(game);
  if (locked) return <><Header /><main className="j-empty"><LockKeyhole size={36} /><h1>This room is already hosting.</h1><p>Switch to the original host tab. For another screen, open the audience display below.</p><Link className="j-button" to={`/jeopardy/display?room=${room}`}>Open audience display</Link></main></>;
  return <div onPointerDown={unlockAudio} className={tv ? 'j-tv-shell' : ''}>
    {!tv && <><Header compact /><div className="j-host-topbar"><div><span className="j-eyebrow">YOU’RE RUNNING THE SHOW</span><h1>{game.board.title}</h1></div><div className="j-actions"><Button variant="secondary" onClick={() => setPairing(true)}><Smartphone size={18} /> Connect devices</Button><Button onClick={() => { setTv(true); fullscreen(); }}><Monitor size={18} /> TV mode</Button><FullscreenButton /></div></div></>}
    {!tv && <div className="j-host-status"><span><span className={`j-dot ${status.remoteReady ? '' : 'j-dot-muted'}`} />{status.remoteReady ? 'Room online' : 'Playing on this computer'} · {status.connections} device{status.connections === 1 ? '' : 's'}</span><span>Room <strong>{room}</strong></span>{status.error && <span className="j-warning">{status.error} <button className="j-inline-button" onClick={() => { setStatus({ remoteReady: false, connections: 0, error: '' }); setNetworkAttempt(value => value + 1); }}>Reconnect</button></span>}{storageError && <span role="alert" className="j-warning">{storageError}</span>}</div>}
    <div className={tv ? 'j-tv-layout' : 'j-host-layout'}><Board state={publicGame} onChoose={id => dispatch({ type: 'SELECT', id })} onReveal={!tv ? () => dispatch({ type: 'REVEAL' }) : undefined} />{!tv && <Controls game={game} dispatch={dispatch} />}</div>
    {tv && <button className="j-exit-tv" onClick={() => setTv(false)}><Settings2 size={16} /> Host controls · Esc</button>}
    {!tv && <div className="j-host-footer"><span>SPACE Reveal answer <span>·</span> B Back to board <span>·</span> F Fullscreen</span><p>Keep this computer open and awake. Pair your phone, then enter TV mode before mirroring with AirPlay.</p></div>}
    {pairing && <Modal title="One screen for the room. One for you." onClose={() => setPairing(false)} wide><Pairing game={game} online={status.remoteReady} /><div className="j-info-box"><Monitor size={23} /><p>Open the private link on your phone first. Then close this dialog, choose <strong>TV mode</strong>, and mirror the computer with AirPlay. The host controls stay on your phone. Keep both devices awake; the same Wi-Fi works best.</p></div></Modal>}
  </div>;
}

function Pairing({ game, online }) {
  const controlLink = `${roomUrl('control', game.room)}#key=${game.key}`;
  return <><div className="j-pair-grid"><section><span className="j-eyebrow"><LockKeyhole size={15} /> PRIVATE · JUST FOR YOU</span><h3>Host from your phone</h3><QR value={controlLink} label="Private QR for host controls" /><p>Room <strong>{game.room}</strong><br />Private key <code>{game.key}</code></p><CopyLink value={controlLink} label="Copy host link" /><Link className="j-text-link" to={controlLink.replace(window.location.origin, '')} target="_blank" rel="noopener noreferrer">Open controls in another tab <ChevronRight size={15} /></Link></section>
    <section><span className="j-eyebrow"><Users size={15} /> PUBLIC · FOR YOUR FRIENDS</span><h3>Join the buzzers</h3><QR value={roomUrl('buzzer', game.room)} label="Public QR for player buzzers" /><p>Scan, enter a name, and join.<br />The host adds players automatically.</p><CopyLink value={roomUrl('buzzer', game.room)} label="Copy buzzer link" /><Link className="j-text-link" to={`/jeopardy/display?room=${game.room}`} target="_blank" rel="noopener noreferrer">Open a separate audience display <ChevronRight size={15} /></Link></section></div>
    {!online && <p className="j-warning">Remote pairing is still connecting or unavailable. This computer and other tabs can keep playing. Try reconnecting the room service for phones.</p>}</>;
}

export function Board({ state, onChoose, onReveal, offset = 0 }) {
  const winner = state.players.find(player => player.id === state.winner);
  const ranking = [...state.players].sort((a, b) => b.score - a.score);
  const total = state.categories.reduce((sum, cat) => sum + cat.clues.filter(clue => clue.ready).length, 0);
  const finished = state.ended;
  return <section className={`j-stage j-theme-${state.theme}`} aria-label="Game display">
    <div className="j-stage-header"><div><span className="j-stage-brand"><Grid2X2 size={16} /> GAME NIGHT</span><h2>{state.title}</h2></div><div className="j-stage-meta"><span>{state.used.length} / {total} played</span><span className="j-room-code">ROOM {state.room}</span></div></div>
    {state.showJoin ? <div className="j-join-stage"><span className="j-eyebrow">THE MORE, THE LOUDER</span><h2>Grab your phone.<br />You’re in.</h2><QR value={roomUrl('buzzer', state.room)} label="Scan to join the game buzzer" /><p>Scan to join the buzzers, or visit</p><strong>{window.location.host}/jeopardy/buzzer</strong><span className="j-big-room">{state.room}</span></div>
      : finished ? <div className="j-results"><Trophy size={48} /><span className="j-eyebrow">THAT’S A WRAP</span><h2>{ranking.length ? ranking.filter(player => player.score === ranking[0].score).map(player => player.name).join(' & ') : 'Good game!'}{ranking.length ? ' takes the night.' : ''}</h2><p>{ranking.length ? `${formatScore(ranking[0].score)} points. Bragging rights included.` : 'Same time next week?'}</p><div>{ranking.map((player, index) => <div className="j-result-row" key={player.id}><span>{index + 1}</span><strong>{player.name}</strong><b>{formatScore(player.score)}</b></div>)}</div></div>
      : state.clue ? <div className={`j-clue-stage ${state.revealed ? 'is-revealed' : ''}`} key={state.clue.id}><div className="j-clue-meta"><span>{state.clue.category}</span><span>{state.clue.double && 'DOUBLE POINTS · '}{formatScore(state.clue.value)} PTS</span><Timer end={state.timerEnd} remaining={state.timerRemaining} offset={offset} /></div><div className="j-clue-content"><p className="j-question">{state.clue.question}</p>{state.revealed && <div className="j-answer" aria-live="polite"><span className="j-eyebrow">THE ANSWER</span><p>{state.clue.answer}</p></div>}</div>
        <div className="j-clue-status" aria-live="polite">{winner ? <span className="j-winner"><Bell size={22} /> {winner.name} buzzed first!</span> : state.revealed ? <span>Answer revealed</span> : state.buzzOpen ? <span><span className="j-dot" /> Buzzers are open</span> : <span><LockKeyhole size={16} /> Buzzers are locked</span>}{onReveal && !state.revealed && <Button variant="secondary" onClick={onReveal}><Eye size={16} /> Reveal answer</Button>}</div></div>
      : <div className="j-play-board-scroll"><div className="j-play-board" style={{ '--cols': state.categories.length, '--rows': Math.max(...state.categories.map(cat => cat.clues.length)) }}>
        {state.categories.map(category => <div className="j-play-category" key={category.id}><h3>{category.name || 'Untitled category'}</h3>{category.clues.map(clue => {
          const used = state.used.includes(clue.id);
          return <button key={clue.id} className={`j-play-tile ${used ? 'is-used' : ''}`} disabled={!onChoose || used || !clue.ready} onClick={() => onChoose?.(clue.id)} aria-label={`${category.name}, ${clue.value} points${used ? ', played' : !clue.ready ? ', unfinished' : ''}`}>{used ? <Check size={23} /> : clue.ready ? formatScore(clue.value) : <span className="j-unfinished">—</span>}</button>;
        })}{Array.from({ length: Math.max(...state.categories.map(cat => cat.clues.length)) - category.clues.length }, (_, i) => <div className="j-empty-tile" key={i} />)}</div>)}
      </div>{state.used.length === total && total > 0 && <div className="j-board-complete"><Trophy size={19} /> All clues played. Host, hit “Finish game” for the final scores.</div>}</div>}
    <div className="j-score-strip">{state.players.length ? state.players.map(player => <div key={player.id} className={`j-score ${state.winner === player.id ? 'is-winner' : ''}`} style={{ '--player-color': player.color }}><span>{player.name}</span><strong>{formatScore(player.score)}</strong></div>) : <div className="j-no-players"><Users size={19} /> A good night needs a few rivals. Join with the room code or add players from the host panel.</div>}</div>
  </section>;
}

function Controls({ game, dispatch, remote = false, disabled = false, offset = 0 }) {
  const [newName, setNewName] = useState('');
  const [editPlayer, setEditPlayer] = useState(null);
  const [customPoints, setCustomPoints] = useState('');
  const [editedName, setEditedName] = useState('');
  const [finish, setFinish] = useState(false);
  const clue = findClue(game.board, game.active);
  const winner = game.players.find(player => player.id === game.winner);
  const canUndo = game.canUndo ?? !!game.history.length;
  const act = action => { if (!disabled) { unlockAudio(); dispatch(action); } };
  const selectData = publicState(game);
  return <aside className={`j-controls ${remote ? 'j-remote-controls' : ''}`} aria-label="Private host controls">
    <div className="j-controls-title"><span><LockKeyhole size={16} /> HOST CONTROLS</span><span className="j-private-badge">ONLY YOU</span></div>
    <fieldset disabled={disabled}>
    <div className="j-control-section"><div className="j-section-label">THE ROUND<IconButton label="Undo last game action" disabled={!canUndo} onClick={() => act({ type: 'UNDO' })}><Undo2 size={17} /></IconButton></div>
      {game.ended ? <div className="j-info-box"><Trophy size={24} /><p>Game finished. Head to My boards to start a fresh round, or undo to keep playing.</p></div> : clue ? <>
        <div className="j-private-answer"><span>{clue.category} · {formatScore(clueValue(clue))} PTS</span><p className="j-host-question">{clue.question}</p><small>ANSWER · NEVER SHOWN UNTIL REVEAL</small><strong>{clue.answer}</strong>{clue.notes && <p className="j-host-notes">{clue.notes}</p>}</div>
        <div className="j-control-buttons"><Button onClick={() => act({ type: 'REVEAL' })} disabled={game.revealed}><Eye size={17} />{game.revealed ? 'Answer revealed' : 'Reveal answer'}</Button><Button variant="secondary" onClick={() => act({ type: 'RETURN' })}><Grid2X2 size={17} /> Back to board</Button></div><button className="j-inline-button" onClick={() => act({ type: 'RETURN', keep: true })}>Return without marking as played</button>
        <div className="j-buzzer-controls"><div><Bell size={17} /><span>{winner ? `${winner.name} is up` : game.buzzOpen ? 'Buzzers open' : 'Buzzers locked'}</span></div><div className="j-actions"><Button variant="secondary" disabled={game.revealed} onClick={() => act({ type: game.buzzOpen ? 'CLOSE_BUZZERS' : 'OPEN_BUZZERS' })}>{game.buzzOpen ? <LockKeyhole size={15} /> : <Bell size={15} />}{game.buzzOpen ? 'Lock' : 'Open'}</Button><IconButton label="Reset all buzzers and let everyone try again" disabled={game.revealed} onClick={() => act({ type: 'OPEN_BUZZERS', reset: true })}><RefreshCw size={17} /></IconButton></div></div>
        {!!game.board.settings.timerSeconds && <Button className="j-timer-control" variant="ghost" disabled={game.revealed} onClick={() => act({ type: 'TIMER' })}>{game.timerEnd ? <Pause size={17} /> : <TimerIcon size={17} />}{game.timerEnd ? 'Pause timer' : game.timerRemaining ? 'Resume timer' : `Start ${game.board.settings.timerSeconds}s timer`}<Timer end={game.timerEnd} remaining={game.timerRemaining} offset={offset} /></Button>}
      </> : <p className="j-muted">{remote ? 'Pick the clue your friends call out below.' : 'Pick a tile on the board to put the clue on screen.'}</p>}
      {remote && !clue && !game.ended && <div className="j-remote-picker">{selectData.categories.map(category => <div key={category.id}><h3>{category.name}</h3><div>{category.clues.map(item => <button key={item.id} disabled={!item.ready || game.used.includes(item.id)} onClick={() => act({ type: 'SELECT', id: item.id })}>{game.used.includes(item.id) ? <Check size={16} /> : item.value}</button>)}</div></div>)}</div>}
    </div>
    <div className="j-control-section"><div className="j-section-label">PLAYERS & SCORES<span>{game.players.length}/{MAX_PLAYERS}</span></div><div className="j-player-list">{game.players.map(player => <div className={`j-player-row ${player.id === game.winner ? 'is-active' : ''}`} key={player.id}>
      <div className="j-player-heading"><span className="j-player-dot" style={{ background: player.color }} /><strong>{player.name}</strong><span>{formatScore(player.score)}</span><IconButton label={`Manage ${player.name}`} onClick={() => { setEditPlayer(player); setEditedName(player.name); setCustomPoints(''); }}><Pencil size={14} /></IconButton></div>
      {clue && <div className="j-player-score-actions"><button className="j-correct" disabled={game.awarded.includes(player.id)} onClick={() => act({ type: 'JUDGE', playerId: player.id, correct: true })}><Check size={15} /> +{formatScore(clueValue(clue))}</button><button className="j-incorrect" disabled={game.rejected.includes(player.id) || game.awarded.includes(player.id)} onClick={() => act({ type: 'JUDGE', playerId: player.id, correct: false })}><X size={15} />{game.board.settings.deductWrong ? `−${formatScore(clueValue(clue))}` : 'Incorrect'}</button></div>}
    </div>)}</div>
      {!game.players.length && <p className="j-muted">Add names here, or let friends join with their phone buzzers.</p>}
      {!game.ended && <form className="j-add-player" onSubmit={event => { event.preventDefault(); if (!newName.trim()) return; act({ type: 'ADD_PLAYER', name: newName }); setNewName(''); }}><input aria-label="New player or team name" placeholder="Add player or team" maxLength={32} value={newName} onChange={event => setNewName(event.target.value)} /><IconButton label="Add player" disabled={!newName.trim() || game.players.length >= MAX_PLAYERS} type="submit"><Plus size={19} /></IconButton></form>}
    </div>
    <div className="j-control-section j-control-footer"><Button variant="secondary" onClick={() => act({ type: 'TOGGLE_JOIN' })}><QrCode size={17} />{game.showJoin ? 'Hide join screen' : 'Show buzzer QR on TV'}</Button>{!game.ended && <Button variant="ghost" onClick={() => setFinish(true)}><Trophy size={17} /> Finish game</Button>}{game.ended && <Link className="j-button j-secondary" to="/jeopardy">My boards <ChevronRight size={17} /></Link>}</div>
    </fieldset>
    {editPlayer && <Modal title={`Manage ${editPlayer.name}`} onClose={() => setEditPlayer(null)}><div className="j-form"><label>Name<input value={editedName} maxLength={32} onChange={event => setEditedName(event.target.value)} /></label><Button variant="secondary" disabled={!editedName.trim() || disabled} onClick={() => { act({ type: 'RENAME_PLAYER', playerId: editPlayer.id, name: editedName }); setEditPlayer(null); }}>Save name</Button><label>Adjust score<input type="number" placeholder="e.g. 200 or -100" min="-1000000" max="1000000" value={customPoints} onChange={event => setCustomPoints(event.target.value)} /></label><Button disabled={!customPoints || disabled} onClick={() => { act({ type: 'SCORE', playerId: editPlayer.id, amount: Number(customPoints) }); setEditPlayer(null); }}><Plus size={16} /> Apply adjustment</Button><div className="j-divider" /><p className="j-muted">Removing a player also disconnects their buzzer from scoring. Undo can restore them.</p><Button variant="danger" disabled={disabled} onClick={() => { act({ type: 'REMOVE_PLAYER', playerId: editPlayer.id }); setEditPlayer(null); }}><Trash2 size={16} /> Remove player</Button></div></Modal>}
    {finish && <Modal title="Call it a night?" onClose={() => setFinish(false)}><p>Show the final standings. You can undo this if the room demands an encore.</p><div className="j-actions j-modal-actions"><Button variant="secondary" onClick={() => setFinish(false)}>Keep playing</Button><Button disabled={disabled} onClick={() => { act({ type: 'FINISH' }); setFinish(false); }}><Trophy size={17} /> Show results</Button></div></Modal>}
  </aside>;
}

function initialJoin(role) {
  const query = new URLSearchParams(window.location.search);
  const fragment = new URLSearchParams(window.location.hash.slice(1));
  const room = (query.get('room') || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
  const key = (fragment.get('key') || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
  return { room, key, role };
}
export function JoinPage({ role }) {
  const [initial] = useState(() => initialJoin(role));
  const [room, setRoom] = useState(initial.room);
  const [key, setKey] = useState(initial.key);
  const [name, setName] = useState(() => { try { return localStorage.getItem('jeopardy-player-name') || ''; } catch { return ''; } });
  const [request, setRequest] = useState(() => initial.room.length === 6 && (role === 'display' || (role === 'control' && initial.key)) ? { ...initial } : null);
  const [game, setGame] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [status, setStatus] = useState({ connected: false, error: '' });
  const [attempt, setAttempt] = useState(0);
  const [offset, setOffset] = useState(0);
  const [device] = useState(deviceId);
  const connection = useRef(null);
  useAwake();
  useEffect(() => {
    if (!request) return;
    setStatus({ connected: false, error: '' });
    let live = true;
    const client = connectToRoom({ ...request, device,
      onState: (state, player, sentAt) => { if (live) { setGame(state); setPlayerId(player); setOffset(sentAt - Date.now()); } },
      onStatus: patch => { if (live) setStatus(previous => ({ ...previous, ...patch })); } });
    connection.current = client;
    return () => { live = false; client.dispose(); connection.current = null; };
  }, [request, attempt, device]);
  const join = event => {
    event.preventDefault(); unlockAudio();
    if (role === 'buzzer') { try { localStorage.setItem('jeopardy-player-name', name.trim()); } catch { /* Optional preference. */ } }
    setRequest({ room, key, role, name: name.trim() }); setGame(null);
  };
  if (request) return <div className={role === 'display' ? 'j-display-page' : 'j-joined-page'} onPointerDown={unlockAudio}>
    {role !== 'display' && <Header compact />}
    <div className={`j-connection-bar ${!status.connected ? 'is-offline' : ''}`} role="status"><span><span className={`j-dot ${status.connected ? '' : 'j-dot-muted'}`} />{status.connected ? `${role === 'control' ? 'Private host' : role === 'buzzer' ? 'Buzzer' : 'Audience display'} connected · ${room}` : status.error || 'Connecting to your room…'}</span>{role === 'display' && <FullscreenButton />}{(!status.connected || status.error) && <Button variant="secondary" onClick={() => setAttempt(value => value + 1)}><RefreshCw size={15} /> Reconnect</Button>}<button className="j-inline-button" onClick={() => { setRequest(null); setGame(null); }}>Leave</button></div>
    {!game ? <div className="j-connecting"><div className="j-connection-orbit"><Wifi size={35} /></div><h1>{status.error ? 'Let’s get you connected.' : 'Finding your game night…'}</h1><p>Keep the host computer open and awake. Phones need internet access to pair. If the connection stalls, use the same Wi-Fi.</p></div>
      : role === 'control' ? <div className="j-phone-host"><div className="j-phone-heading"><span className="j-eyebrow">YOUR SECRET CONTROL ROOM</span><h1>{game.board.title}</h1></div><Controls game={game} dispatch={action => connection.current?.command(action)} remote disabled={!status.connected} offset={offset} /></div>
      : role === 'display' ? <Board state={game} offset={offset} />
      : <Buzzer state={game} playerId={playerId} connected={status.connected} onBuzz={epoch => connection.current?.buzz(epoch)} />}
  </div>;
  return <><Header compact /><main className="j-join-page"><div className="j-join-icon">{role === 'control' ? <LockKeyhole size={32} /> : role === 'display' ? <Monitor size={32} /> : <Bell size={32} />}</div><span className="j-eyebrow">{role === 'control' ? 'BACKSTAGE PASS' : role === 'display' ? 'THE BIG SCREEN' : 'QUICK THUMBS. BIG OPINIONS.'}</span><h1>{role === 'control' ? 'Take the host seat.' : role === 'display' ? 'Let’s put on a show.' : 'You know this one.'}</h1><p>{role === 'control' ? 'Use the room code and private key from the host computer.' : role === 'display' ? 'Enter the room code to show only the game and scores.' : 'Join the room. Pick a name. Get ready to buzz.'}</p>
    <form className="j-form j-join-form" onSubmit={join}><label>Room code<input className="j-code-input" value={room} maxLength={6} minLength={6} required autoComplete="off" autoCapitalize="characters" placeholder="ABC123" onChange={event => setRoom(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))} /></label>
      {role === 'control' && <label>Private host key<input className="j-code-input" value={key} minLength={12} maxLength={12} required autoComplete="off" autoCapitalize="characters" placeholder="12-character key" onChange={event => setKey(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12))} /></label>}
      {role === 'buzzer' && <label>Your name or team<input value={name} maxLength={32} required placeholder="The reigning champ" onChange={event => setName(event.target.value)} /></label>}
      <Button type="submit" disabled={room.length !== 6 || (role === 'control' && key.length !== 12) || (role === 'buzzer' && !name.trim())}>{role === 'control' ? 'Open host controls' : role === 'display' ? 'Open display' : 'I’m in'} <ChevronRight size={18} /></Button>
    </form>{role === 'buzzer' && <Link className="j-text-link" to="/jeopardy/control">Hosting instead? <ArrowLeft size={15} /></Link>}
  </main></>;
}

function Buzzer({ state, playerId, connected, onBuzz }) {
  const player = state.players.find(item => item.id === playerId);
  const winner = state.players.find(item => item.id === state.winner);
  const [pending, setPending] = useState(false);
  const last = useRef(null);
  useEffect(() => { setPending(false); }, [state.revision, connected]);
  useEffect(() => {
    if (state.winner === playerId && last.current !== state.winner) { navigator.vibrate?.([100, 50, 100]); chime(); }
    last.current = state.winner;
  }, [state.winner, playerId]);
  const rejected = state.rejected.includes(playerId);
  const canBuzz = connected && player && state.buzzOpen && !state.winner && !state.revealed && !pending && !rejected && !state.ended;
  const buzz = () => { if (!canBuzz) return; unlockAudio(); if (onBuzz(state.buzzEpoch)) { setPending(true); navigator.vibrate?.(40); } };
  useEffect(() => {
    const press = event => { if (event.code === 'Space' && !['INPUT', 'BUTTON'].includes(event.target.tagName)) { event.preventDefault(); buzz(); } };
    window.addEventListener('keydown', press); return () => window.removeEventListener('keydown', press);
  });
  const isWinner = winner?.id === playerId;
  return <main className={`j-buzzer-page ${isWinner ? 'j-buzzer-won' : ''}`}><div className="j-buzzer-player"><span className="j-eyebrow">{state.title}</span><h1>{player?.name || 'Player removed'}</h1><span className="j-buzzer-score">{formatScore(player?.score || 0)} <small>POINTS</small></span></div>
    <div className="j-buzzer-message" aria-live="polite"><h2>{!connected ? 'Connection paused.' : !player ? 'Ask the host to add you back.' : state.ended ? 'That’s a wrap!' : isWinner ? 'YOU’RE UP!' : winner ? `${winner.name} got it!` : rejected ? 'Sit tight for the next clue.' : state.revealed ? 'Answer revealed.' : pending ? 'Buzz sent…' : canBuzz ? 'Know it? Go for it.' : 'Wait for the host.'}</h2><p>{isWinner ? 'The floor is yours. Make it count.' : state.clue ? `${state.clue.category} · ${formatScore(state.clue.value)} points` : 'Your next chance is coming.'}</p></div>
    <button className="j-big-buzzer" disabled={!canBuzz} onPointerDown={event => { if (event.button === 0) { event.preventDefault(); buzz(); } }} onClick={event => { if (event.detail === 0) buzz(); }} aria-label="Buzz in"><Bell size={49} /><strong>{isWinner ? 'FIRST!' : canBuzz ? 'BUZZ' : 'LOCKED'}</strong><span>{canBuzz ? 'TAP TO BUZZ IN' : 'KEEP THIS SCREEN OPEN'}</span></button>
    <p className="j-buzzer-fineprint">First buzz received by the host wins. Stay on this screen and use the same Wi-Fi for the fairest game.</p>
    {state.players.length > 0 && <div className="j-buzzer-standings">{[...state.players].sort((a, b) => b.score - a.score).map(item => <div key={item.id}><span>{item.name}{item.id === playerId ? ' (you)' : ''}</span><strong>{formatScore(item.score)}</strong></div>)}</div>}
  </main>;
}
