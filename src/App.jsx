import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Home } from "./pages/Home";
import { NotFound } from "./pages/NotFound";
import Games from "./pages/Games";
import AlienReflex from "./pages/AlienReflex";
import { Toaster } from "@/components/ui/toaster";
import SignalNoise from "./pages/SignalNoise";
import WritingsEssay from "@/pages/WritingsEssay";
import Object from "./pages/ObjectFolder";
import WritingsEssay2 from "@/pages/WritingsEssay2";
import HardGame from "./pages/HardGame";


function App() {
  return (
    <>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route index element={<Home />} />

          <Route path="/games" element={<Games />} />
          <Route path="/games/signal-noise" element={<SignalNoise />} />
          <Route path="/games/alien-reflex" element={<AlienReflex />} />
          <Route path="/games/hard-game" element={<HardGame />} />

          <Route path="/writings/directed-bias" element={<WritingsEssay />} />
          <Route path="/writings/essay-2" element={<WritingsEssay2 />} />
          <Route path="/object" element={<Object />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
