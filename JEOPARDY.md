# Game Night · Jeopardy Studio

The UI/UX project card opens `/jeopardy`. The rest of the portfolio keeps its existing routes and styles; the game loads as a separate bundle.

## Hosting a game

1. Create a board, or explicitly choose **Use a starter** for an editable 25-clue sample. New blank boards start with five categories and five clues per category, worth 200–1000 points.
2. Click a tile to enter a question, answer, and optional private notes. Add/delete clues or categories, reorder categories, set individual values, or reset values by row. Unfinished clues are disabled during play.
3. **Host game** starts a copy of the board. Add manual players/teams, or leave the list empty for players who will join from their phones. Phone joins create players automatically; do not pre-add those same players unless you want separate manual teams.
4. On the computer, use **Connect devices**. Scan the **private host QR** with your phone. Keep that link/key private: it grants access to the answer key and scoring controls.
5. Close the pairing dialog and choose **TV mode**. Mirror the computer to the TV with AirPlay. Only the board, active clue, revealed answer, and scores appear on the TV. Private controls remain on the phone. Escape brings back local controls. Fullscreen support varies by browser.
6. Show the **public buzzer QR on TV**, or share the buzzer link. Players enter names. Open buzzers after reading a clue; the first buzz **received by the host computer** wins and locks the others out. Network latency means this is a casual party buzzer, not tournament timing.
7. Mark answers correct/incorrect, reveal the answer, and return to the board. Incorrect players are locked out for that clue unless the host resets buzzers. Use Undo for mistakes and the player edit button for arbitrary score adjustments/removals. Finish the game to show standings.

## Routes

| Route | Purpose |
| --- | --- |
| `/jeopardy` | Saved board library, import, export, duplicate, delete |
| `/jeopardy/edit/:id` | Autosaving board editor |
| `/jeopardy/host/:room` | Authoritative host computer; can become the clean TV display |
| `/jeopardy/control?room=CODE#key=PRIVATEKEY` | Private phone controller |
| `/jeopardy/display?room=CODE` | Additional read-only audience display |
| `/jeopardy/buzzer?room=CODE` | Player buzzer |

## Saving and connections

- Boards and in-progress sessions are stored in **this browser's localStorage**. There is no account, shared online board database, or automatic cross-device library sync. Export JSON backups; import them on another computer/browser. Clearing site data removes saved boards. Phone controllers receive the active game, not the saved library.
- A host refresh restores the game, players, scores, private key, and room code. Other devices may need **Reconnect**. Closing the host tab stops the room. Keep the host computer and phone screens awake; a supported wake-lock request helps, but background/sleep restrictions are browser-dependent.
- Same-browser tabs use BroadcastChannel. Separate devices use encrypted WebRTC data channels with the public PeerJS Cloud signaling service. No paid service/account/API key is required. See the [PeerJS docs](https://peerjs.com/client/api/peer).
- Internet access is needed for remote pairing. The same Wi-Fi is recommended. Restrictive networks, device isolation, public signaling outages, or some NAT configurations can prevent remote connections; no private TURN relay is configured. Connection errors and reconnect actions are shown explicitly, and local play remains available. A production reliability upgrade could use a managed relay/backend.
- Only authenticated controllers receive the answer key and private notes. Audience and buzzer connections receive public board metadata and the current answer **only after reveal**. Player identity is bound at joining; client messages cannot assign their own score or select a different buzzer identity. The host accepts one buzz per round and ignores duplicate command IDs.
- Keyboard shortcuts on the host computer: **Space** reveal, **B** return and mark played, **F** fullscreen, **Escape** leave TV mode. Shortcuts are disabled in text inputs and dialogs.

## Development and verification

```sh
npm install
npm run dev
npm run test:jeopardy
npm run build
```

Pure rule tests cover scoring, undo, timer expiry, imports, save/restore, player reconnection, and answer secrecy. Protocol tests exercise the real host/client message handlers with deterministic PeerJS-compatible connections and same-browser channels, including unauthorized controllers, spoofed commands, simultaneous buzzes, duplicate command delivery, and reconnects. Real phone/AirPlay testing is still recommended on the network you will use.

Core code lives in `src/jeopardy/` and the library/editor route in `src/pages/Jeopardy.jsx`. Existing Vercel SPA rewrites handle all nested routes.
