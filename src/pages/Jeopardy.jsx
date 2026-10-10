import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { ArrowDownToLine, ArrowLeft, ArrowRight, Bell, Check, CheckCircle2, ChevronLeft, ChevronRight, CircleHelp, Copy, FileUp, Grid2X2, Monitor, Pencil, Play, Plus, Search, Settings2, Sparkles, Trash2, Users, X } from 'lucide-react';
import { allClues, MAX_CATEGORIES, MAX_CLUES, newBoard, newCategory, newClue, newSession, normalizeBoard, points, readyClues } from '../jeopardy/model';
import { exportBoard, importBoard, readBoards, readSession, saveBoards, saveSession } from '../jeopardy/storage';
import { starterBoard } from '../jeopardy/starter';
import { Button, Header, IconButton, Modal, unlockAudio } from '../jeopardy/ui';
import { HostPage, JoinPage } from '../jeopardy/live';
import '../jeopardy/jeopardy.css';

const LibraryContext = createContext(null);
const useLibrary = () => useContext(LibraryContext);
function loadLibrary() {
  try { return { boards: readBoards(), error: '', blocked: false }; }
  catch { return { boards: [], error: 'Your saved library could not be read. Browser storage may be blocked or damaged. You can still create a board and export it.', blocked: true }; }
}
export default function Jeopardy() {
  const [library, setLibrary] = useState(loadLibrary);
  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Game Night · Jeopardy Studio';
    return () => { document.title = previousTitle; };
  }, []);
  const persist = boards => {
    let error = '';
    try { if (library.blocked) throw new Error(library.error); saveBoards(boards); }
    catch (failure) { error = failure.message; }
    setLibrary(previous => ({ ...previous, boards, error }));
    return !error;
  };
  const update = board => persist(library.boards.some(item => item.id === board.id)
    ? library.boards.map(item => item.id === board.id ? { ...board, updatedAt: Date.now() } : item)
    : [{ ...board, updatedAt: Date.now() }, ...library.boards]);
  return <LibraryContext.Provider value={{ ...library, persist, update }}><div className="jeopardy">
    <Routes>
      <Route index element={<Library />} />
      <Route path="edit/:id" element={<Editor />} />
      <Route path="host/:room" element={<HostPage />} />
      <Route path="control" element={<JoinPage role="control" />} />
      <Route path="display" element={<JoinPage role="display" />} />
      <Route path="buzzer" element={<JoinPage role="buzzer" />} />
      <Route path="*" element={<Missing />} />
    </Routes>
  </div></LibraryContext.Provider>;
}
function Missing() {
  return <><Header /><main className="j-empty"><h1>That board wandered off.</h1><Link className="j-button" to="/jeopardy">Back to my boards</Link></main></>;
}
function Library() {
  const { boards, update, persist, error } = useLibrary();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('recent');
  const [remove, setRemove] = useState(null);
  const [host, setHost] = useState(null);
  const [help, setHelp] = useState(false);
  const [notice, setNotice] = useState('');
  const fileRef = useRef(null);
  const [resume] = useState(() => { try { const room = localStorage.getItem('idrees-jeopardy-last-room'); const game = room && readSession(room); return game && !game.ended ? game : null; } catch { return null; } });
  const create = sample => { const board = sample ? starterBoard() : newBoard(); update(board); navigate(`/jeopardy/edit/${board.id}`); };
  const upload = async event => {
    const file = event.target.files?.[0]; event.target.value = '';
    if (!file) return;
    try { const board = await importBoard(file); update(board); setNotice(`Imported “${board.title}”.`); }
    catch (failure) { setNotice(failure.message); }
  };
  const displayed = [...boards].filter(board => `${board.title} ${board.description}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => sort === 'name' ? a.title.localeCompare(b.title) : b.updatedAt - a.updatedAt);
  return <><Header /><main className="j-container">
    {error && <div className="j-alert" role="alert">{error}</div>}
    <section className="j-hero">
      <div className="j-hero-copy"><span className="j-eyebrow"><span className="j-dot" /> A LITTLE FRIENDLY COMPETITION</span>
        <h1>Your people.<br />Your questions.<br /><em>Your game night.</em></h1>
        <p>Make a board. Call your friends. Settle who actually knows the most.</p>
        <div className="j-actions"><Button onClick={() => create(false)}><Plus size={19} /> Create a board</Button><Button variant="secondary" onClick={() => setHelp(true)}><CircleHelp size={18} /> How to play</Button></div>
        <div className="j-hero-details"><span><Check size={14} /> Your rules</span><span><Check size={14} /> Big-screen ready</span><span><Check size={14} /> Phone buzzers</span></div>
      </div>
      <div className="j-hero-art" aria-hidden="true"><div className="j-preview-top"><span><span className="j-dot" /> LIVE FROM YOUR LIVING ROOM</span><span>05 × 05</span></div>
        <div className="j-preview-board">{['POP CULTURE', 'WILD CARD', 'SCIENCE-ISH', 'FOOD COMA', 'YOUR LORE'].map((name, i) => <div className="j-preview-column" key={name}><strong>{name}</strong>{[200, 400, 600, 800, 1000].map((value, j) => <div className={i === 2 && j === 1 ? 'j-preview-selected' : ''} key={value}>{i === 0 && j === 3 ? '✓' : value}{i === 2 && j === 1 && <span className="j-cursor">↖</span>}</div>)}</div>)}</div>
        <div className="j-preview-bottom"><span><Users size={14} /> The group chat, but competitive.</span><span>LET’S PLAY <ArrowUpRightIcon /></span></div>
        <div className="j-float-label"><Bell size={17} /> You’re up!</div>
      </div>
    </section>
    <section className="j-library" aria-labelledby="boards-heading">
      <div className="j-section-heading"><div><span className="j-eyebrow">THE LINEUP</span><h2 id="boards-heading">My boards <span className="j-count">{boards.length}</span></h2></div><div className="j-actions"><input type="file" ref={fileRef} accept=".json,application/json" className="j-sr-only" onChange={upload} /><Button variant="secondary" onClick={() => fileRef.current.click()}><FileUp size={17} /> Import game</Button><Button variant="ghost" onClick={() => create(true)}><Sparkles size={17} /> Use a starter</Button></div></div>
      <div className="j-library-tools"><label className="j-search"><Search size={18} /><input placeholder="Find your next game night…" aria-label="Search boards" value={query} onChange={event => setQuery(event.target.value)} /></label><select aria-label="Sort boards" value={sort} onChange={event => setSort(event.target.value)}><option value="recent">Recently edited</option><option value="name">A to Z</option></select></div>
      {notice && <div className="j-notice" role="status">{notice}<IconButton label="Dismiss notice" onClick={() => setNotice('')}><X size={16} /></IconButton></div>}
      {resume && <div className="j-resume"><span><span className="j-dot" /> Game in progress: <strong>{resume.board.title}</strong></span><Link to={`/jeopardy/host/${resume.room}`}>Resume room {resume.room} <ArrowRight size={16} /></Link></div>}
      <div className="j-card-grid">{displayed.map(board => <article className={`j-board-card j-theme-${board.settings.theme}`} key={board.id}>
        <button className="j-card-art" onClick={() => navigate(`/jeopardy/edit/${board.id}`)} aria-label={`Edit ${board.title}`}><div className="j-mini-board">{board.categories.slice(0, 5).map(cat => <div key={cat.id}><span>{cat.name}</span>{cat.clues.slice(0, 5).map(clue => <b key={clue.id}>{clue.value}</b>)}</div>)}</div><span className="j-card-ready">{readyClues(board).length === allClues(board).length ? 'READY TO PLAY' : 'IN THE WORKS'}</span></button>
        <div className="j-card-content"><div className="j-card-meta"><span>{board.categories.length} CATEGORIES · {allClues(board).length} CLUES</span><span>{new Date(board.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span></div><h3>{board.title}</h3><p>{board.description || 'A fresh board with your name on it.'}</p>
          <div className="j-card-actions"><Button onClick={() => setHost(board)} disabled={!readyClues(board).length}><Play size={16} fill="currentColor" /> Host game</Button><IconButton label={`Edit ${board.title}`} onClick={() => navigate(`/jeopardy/edit/${board.id}`)}><Pencil size={17} /></IconButton><IconButton label={`Duplicate ${board.title}`} onClick={() => { const copy = normalizeBoard(board); copy.title = `${board.title} (copy)`; update(copy); }}><Copy size={17} /></IconButton><IconButton label={`Export ${board.title}`} onClick={() => exportBoard(board)}><ArrowDownToLine size={17} /></IconButton><IconButton label={`Delete ${board.title}`} onClick={() => setRemove(board)}><Trash2 size={17} /></IconButton></div>
        </div></article>)}
        {(!query || displayed.length > 0) && <button className="j-new-card" onClick={() => create(false)}><span><Plus size={27} /></span><strong>{boards.length ? 'Another round?' : 'Your first game starts here.'}</strong><p>Start with 5 categories and 25 clues.<br />Make every bit of it yours.</p><b>Create a new board <ArrowRight size={16} /></b></button>}
      </div>
      {query && !displayed.length && <div className="j-empty"><Search size={28} /><h3>No boards found.</h3><p>Try a different name.</p></div>}
      <p className="j-storage-note"><CheckCircle2 size={15} /> Saved on this browser. Export a game to back it up or bring it to another device.</p>
    </section>
    <footer className="j-footer"><span>MADE FOR THE “ONE MORE ROUND” PEOPLE.</span><span>Built by Idrees · No account needed</span></footer>
  </main>
  {remove && <Modal title="Delete this board?" onClose={() => setRemove(null)}><p>“{remove.title}” will be removed from this browser. Export it first if you want a backup.</p><div className="j-actions j-modal-actions"><Button variant="secondary" onClick={() => setRemove(null)}>Keep it</Button><Button variant="danger" onClick={() => { persist(boards.filter(board => board.id !== remove.id)); setRemove(null); }}>Delete board</Button></div></Modal>}
  {host && <HostSetup board={host} onClose={() => setHost(null)} />}
  {help && <Modal title="Your living room. Your game show." onClose={() => setHelp(false)} wide><div className="j-help-steps"><div><b>01</b><h3>Build your board</h3><p>Add categories, clues, answers, and point values. Everything saves as you type.</p></div><div><b>02</b><h3>Take the host seat</h3><p>Host a game on your computer. Scan the private host QR with your phone before you start AirPlay.</p></div><div><b>03</b><h3>Let the room play</h3><p>Choose TV mode on the computer and mirror it to the TV. Pick clues, reveal answers, and score from your phone.</p></div></div><div className="j-info-box"><Bell size={21} /><p>Friends scan the public buzzer QR to join. You open the buzzers; the first buzz received by the host locks everyone else out. Keep the computer awake and use the same Wi-Fi when possible.</p></div><Link className="j-text-link" to="/jeopardy/control">Already have a private host key? Join as host <ArrowRight size={16} /></Link></Modal>}
  </>;
}
function ArrowUpRightIcon() { return <span>↗</span>; }
function HostSetup({ board, onClose }) {
  const [names, setNames] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const count = readyClues(board).length;
  const start = event => {
    event.preventDefault();
    const players = names.split('\n').map(name => name.trim()).filter(Boolean).slice(0, 24);
    const game = newSession(board, players);
    try { saveSession(game); unlockAudio(); navigate(`/jeopardy/host/${game.room}`); }
    catch { setError('This browser cannot save the game session. Enable browser storage before hosting.'); }
  };
  return <Modal title="Let’s make a night of it." onClose={onClose}><form onSubmit={start} className="j-form"><div className="j-info-box"><Monitor size={24} /><div><strong>{board.title}</strong><p>{count} playable clues · {board.categories.length} categories</p></div></div>
    {count < allClues(board).length && <p className="j-warning">{allClues(board).length - count} unfinished clues will be disabled. A clue needs both a question and an answer.</p>}
    <label>Players or teams <span className="j-muted">(optional)</span><textarea rows={4} placeholder={'One name per line\nThe Know-It-Alls\nTeam Probably Wrong'} value={names} onChange={event => setNames(event.target.value)} maxLength={1200} /></label><p className="j-muted">These are for manual scoring. Friends joining with phone buzzers get their own player automatically. You can add or remove players anytime.</p>
    {error && <p className="j-warning" role="alert">{error}</p>}<div className="j-modal-actions"><Button type="submit" disabled={!count}><Play size={18} fill="currentColor" /> Start hosting</Button></div></form></Modal>;
}
function Editor() {
  const { id } = useParams();
  const { boards, update, error } = useLibrary();
  const board = boards.find(item => item.id === id);
  const [selected, setSelected] = useState(null);
  const [settings, setSettings] = useState(false);
  const [host, setHost] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [bulkValue, setBulkValue] = useState(200);
  if (!board) return <Missing />;
  const category = board.categories.find(cat => cat.id === selected?.category);
  const clue = category?.clues.find(item => item.id === selected?.clue);
  const change = patch => update({ ...board, ...patch });
  const changeCategory = (catId, transform) => change({ categories: board.categories.map(cat => cat.id === catId ? transform(cat) : cat) });
  const changeClue = patch => changeCategory(category.id, cat => ({ ...cat, clues: cat.clues.map(item => item.id === clue.id ? { ...item, ...patch } : item) }));
  const shift = (idToMove, amount) => {
    const categories = [...board.categories]; const index = categories.findIndex(cat => cat.id === idToMove);
    if (index + amount < 0 || index + amount >= categories.length) return;
    [categories[index], categories[index + amount]] = [categories[index + amount], categories[index]]; change({ categories });
  };
  const selectNext = () => {
    const clues = board.categories.flatMap(cat => cat.clues.map(item => ({ category: cat.id, clue: item.id })));
    const index = clues.findIndex(item => item.clue === clue.id); setSelected(clues[(index + 1) % clues.length]);
  };
  const filled = readyClues(board).length;
  return <><Header compact /><main className="j-editor">
    <div className="j-editor-toolbar"><Link className="j-text-link" to="/jeopardy"><ArrowLeft size={17} /> My boards</Link><span className={`j-save-status ${error ? 'j-warning' : ''}`}>{error ? 'Not saved · export a backup' : <><Check size={14} /> Saved on this browser</>}</span><div className="j-actions"><Button variant="secondary" onClick={() => exportBoard(board)}><ArrowDownToLine size={17} /><span className="j-hide-small">Export</span></Button><Button variant="secondary" onClick={() => setSettings(true)}><Settings2 size={17} /><span className="j-hide-small">Game settings</span></Button><Button disabled={!filled} onClick={() => setHost(true)}><Play size={17} fill="currentColor" /> Host game</Button></div></div>
    {error && <div className="j-alert" role="alert">{error}</div>}
    <div className="j-editor-heading"><span className="j-eyebrow">THE MAKING OF A GOOD NIGHT</span><input className="j-title-input" aria-label="Board title" maxLength={120} value={board.title} onChange={event => change({ title: event.target.value })} placeholder="Give your game a name" /><input className="j-description-input" aria-label="Board description" maxLength={500} value={board.description} onChange={event => change({ description: event.target.value })} placeholder="Add a little context. Or a warning to your friends." /></div>
    <div className="j-editor-board-header"><p><Grid2X2 size={18} /> {board.categories.length} categories <span>·</span> {filled}/{allClues(board).length} clues ready</p><span>Click a tile to write its clue.</span></div>
    <div className="j-editor-scroll"><div className={`j-edit-board j-theme-${board.settings.theme}`}>
      {board.categories.map((cat, catIndex) => <section className="j-edit-category" key={cat.id}>
        <div className="j-category-controls"><span>{String(catIndex + 1).padStart(2, '0')}</span><div><IconButton label={`Move ${cat.name} left`} disabled={catIndex === 0} onClick={() => shift(cat.id, -1)}><ChevronLeft size={15} /></IconButton><IconButton label={`Move ${cat.name} right`} disabled={catIndex === board.categories.length - 1} onClick={() => shift(cat.id, 1)}><ChevronRight size={15} /></IconButton><IconButton label={`Delete ${cat.name}`} disabled={board.categories.length === 1} onClick={() => setDeleting({ category: cat.id, name: cat.name })}><Trash2 size={14} /></IconButton></div></div>
        <input className="j-category-name" aria-label={`Category ${catIndex + 1} name`} value={cat.name} maxLength={60} onChange={event => changeCategory(cat.id, item => ({ ...item, name: event.target.value }))} />
        {cat.clues.map((item, index) => <button className={`j-edit-tile ${item.question.trim() && item.answer.trim() ? 'is-ready' : ''}`} key={item.id} onClick={() => setSelected({ category: cat.id, clue: item.id })} aria-label={`Edit ${cat.name}, clue ${index + 1}, ${item.value} points`}><span>{item.double && <small>2×</small>}{item.value}</span><p>{item.question || 'Write a clue'}</p>{item.question.trim() && item.answer.trim() ? <CheckCircle2 size={14} /> : <Pencil size={13} />}</button>)}
        <button className="j-add-clue" disabled={cat.clues.length >= MAX_CLUES} onClick={() => changeCategory(cat.id, item => ({ ...item, clues: [...item.clues, newClue((item.clues.at(-1)?.value || 0) + 200)] }))}><Plus size={16} /> Add clue</button>
      </section>)}
      <button className="j-add-category" disabled={board.categories.length >= MAX_CATEGORIES} onClick={() => change({ categories: [...board.categories, newCategory(board.categories.length + 1)] })}><Plus size={22} /><span>Add category</span></button>
    </div></div>
    <div className="j-editor-bottom"><p><CheckCircle2 size={16} /> Complete clues have a question and an answer. Unfinished tiles stay off the playing board.</p><Button variant="ghost" disabled={board.categories.every(cat => cat.clues.length >= MAX_CLUES)} onClick={() => change({ categories: board.categories.map(cat => ({ ...cat, clues: cat.clues.length >= MAX_CLUES ? cat.clues : [...cat.clues, newClue((cat.clues.at(-1)?.value || 0) + 200)] })) })}><Plus size={16} /> Add a row to all categories</Button></div>
  </main>
  {clue && <Modal title={`Edit clue · ${category.name}`} onClose={() => setSelected(null)} wide><div className="j-form"><div className="j-form-row"><label>Point value<input type="number" min="0" max="100000" step="50" value={clue.value} onChange={event => changeClue({ value: points(event.target.value) })} /></label><label className="j-checkbox"><input type="checkbox" checked={clue.double} onChange={event => changeClue({ double: event.target.checked })} /><span>Double points <small>Worth {clue.value * 2} when enabled</small></span></label></div>
    <label>Clue / question <span className="j-muted">Shown on the TV</span><textarea autoFocus rows={4} value={clue.question} maxLength={4000} onChange={event => changeClue({ question: event.target.value })} placeholder="This is what the players will see…" /></label>
    <label>Answer <span className="j-muted">Hidden until you reveal it</span><textarea rows={2} value={clue.answer} maxLength={2000} onChange={event => changeClue({ answer: event.target.value })} placeholder="What is…? (Or just the answer. Your rules.)" /></label>
    <label>Host notes <span className="j-muted">Only for you</span><textarea rows={2} value={clue.notes} maxLength={2000} onChange={event => changeClue({ notes: event.target.value })} placeholder="Accept these variations, pronunciation tips, inside jokes…" /></label>
    <div className="j-modal-actions j-split"><Button variant="ghost" disabled={category.clues.length === 1} onClick={() => setDeleting({ category: category.id, clue: clue.id, name: 'this clue' })}><Trash2 size={16} /> Delete clue</Button><div className="j-actions"><Button variant="secondary" onClick={selectNext}>Next clue <ArrowRight size={16} /></Button><Button onClick={() => setSelected(null)}><Check size={17} /> Done</Button></div></div>
  </div></Modal>}
  {settings && <Modal title="Make it your game." onClose={() => setSettings(false)}><div className="j-form">
    <label>Clue timer<select value={board.settings.timerSeconds} onChange={event => change({ settings: { ...board.settings, timerSeconds: Number(event.target.value) } })}>{[0, 10, 15, 20, 30, 45, 60, 90, 120, 180].map(seconds => <option key={seconds} value={seconds}>{seconds ? `${seconds} seconds` : 'No timer'}</option>)}</select></label>
    {[['deductWrong', 'Subtract points for incorrect answers'], ['autoOpenBuzzers', 'Open buzzers as soon as a clue is chosen'], ['sound', 'Play a sound when someone buzzes']].map(([key, text]) => <label className="j-checkbox" key={key}><input type="checkbox" checked={board.settings[key]} onChange={event => change({ settings: { ...board.settings, [key]: event.target.checked } })} /><span>{text}</span></label>)}
    <label>Board color<select value={board.settings.theme} onChange={event => change({ settings: { ...board.settings, theme: event.target.value } })}><option value="violet">After hours · Violet</option><option value="blue">Game show · Blue</option><option value="forest">Night owl · Forest</option></select></label>
    <div className="j-divider" /><label>Reset all point values by row<input type="number" min="1" max="5000" value={bulkValue} onChange={event => setBulkValue(event.target.value)} /></label><p className="j-muted">A step of 200 makes each column 200, 400, 600… This replaces custom point values.</p><Button variant="secondary" onClick={() => { const step = Math.max(1, Math.min(5000, Number(bulkValue) || 200)); change({ categories: board.categories.map(cat => ({ ...cat, clues: cat.clues.map((item, i) => ({ ...item, value: (i + 1) * step })) })) }); }}>Apply point values</Button><Button onClick={() => setSettings(false)}>Done</Button>
  </div></Modal>}
  {deleting && <Modal title={`Delete ${deleting.name}?`} onClose={() => setDeleting(null)}><p>This removes {deleting.clue ? 'the clue and its answer' : 'the category and all its clues'}. Export a backup first if you might want it later.</p><div className="j-modal-actions j-actions"><Button variant="secondary" onClick={() => setDeleting(null)}>Cancel</Button><Button variant="danger" onClick={() => { if (deleting.clue) changeCategory(deleting.category, cat => ({ ...cat, clues: cat.clues.filter(item => item.id !== deleting.clue) })); else change({ categories: board.categories.filter(cat => cat.id !== deleting.category) }); setSelected(null); setDeleting(null); }}>Delete</Button></div></Modal>}
  {host && <HostSetup board={board} onClose={() => setHost(false)} />}
  </>;
}
