import { useState } from "react";
import WordleLevel from "../games/levels/WordleLevel";

export default function HardGame() {
  const [screen, setScreen] = useState("menu"); // menu | game | gameover
  const [showInstructions, setShowInstructions] = useState(false);
  const [lives, setLives] = useState(3);

  const loseLife = () => {
    setLives((l) => {
      const next = l - 1;
      if (next <= 0) {
        setScreen("gameover");
        return 0;
      }
      return next;
    });
  };

  const resetGame = () => {
    setLives(3);
    setScreen("menu");
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center">
      {/* Instructions Modal */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-zinc-800 border border-red-500 rounded-xl p-6 w-full max-w-md relative shadow-lg">
            <button
              onClick={() => setShowInstructions(false)}
              className="absolute top-3 right-3 text-red-400"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold text-yellow-400 mb-4">
              Instructions
            </h2>

            <p className="text-sm text-zinc-300">
              {/* text goes here */}
            </p>

            <button
              onClick={() => setShowInstructions(false)}
              className="mt-6 w-full py-2 rounded-lg bg-red-600 hover:bg-red-500"
            >
              Back
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-xl px-6 text-center">
        {/* MENU */}
        {screen === "menu" && (
          <div className="space-y-10">
            <h1 className="text-5xl font-extrabold text-red-500">
              HARD GAME
            </h1>

            <div className="flex flex-col gap-4">
              <button
                onClick={() => setScreen("game")}
                className="py-4 rounded-xl bg-yellow-400 text-black font-bold text-xl shadow-lg hover:scale-105 transition"
              >
                START
              </button>

              <button
                onClick={() => setShowInstructions(true)}
                className="py-3 rounded-xl border border-red-500 text-red-400 hover:bg-red-500/10"
              >
                Instructions
              </button>
            </div>
          </div>
        )}

        {/* GAME */}
        {screen === "game" && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <button
                onClick={resetGame}
                className="text-sm text-zinc-400"
              >
                ← Back
              </button>

              <div className="flex gap-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-full ${
                      i < lives ? "bg-red-500" : "bg-zinc-700"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="bg-zinc-800 border border-yellow-500 rounded-2xl p-10 shadow-lg">
              <WordleLevel
                onWin={() => {
                  // later: advance to next level
                  alert("Wordle complete");
                  resetGame();
                }}
                onLose={loseLife}
              />
            </div>
          </div>
        )}

        {/* GAME OVER */}
        {screen === "gameover" && (
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-red-500">
              Game Over
            </h2>
            <button
              onClick={resetGame}
              className="px-6 py-3 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-300"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
