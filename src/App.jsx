import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Home } from "./pages/Home";
import { NotFound } from "./pages/NotFound";
import Games from "./pages/Games";
import AlienReflex from "./pages/AlienReflex";
import { Toaster } from "@/components/ui/toaster";
import SignalNoise from "./pages/SignalNoise";
import WritingsEssay from "@/pages/WritingsEssay";



function App() {
  return (
    <>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/writings/directed-bias" element={<WritingsEssay />} />
          <Route index element={<Home />} />
          <Route path="/games/signal-noise" element={<SignalNoise />} />
          <Route path="/games" element={<Games />} />
          <Route path="/games/alien-reflex" element={<AlienReflex />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
