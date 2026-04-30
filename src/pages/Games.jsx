export default function Games() {
  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-4">Games</h1>
      <p className="mb-6">Mini games I’ve made.</p>

      <div className="space-y-4">
        <a
          href="/pong-game/final.html"
          target="_blank"
          rel="noopener noreferrer"
          className="block p-4 border rounded-lg hover:bg-gray-100 transition"
        >
          🎮 Pong Game
        </a>
      </div>
    </div>
  );
}