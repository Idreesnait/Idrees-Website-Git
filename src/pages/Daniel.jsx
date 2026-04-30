export default function Daniel() {
  const mediaCard =
    "relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/40 backdrop-blur-xl";

  const label =
    "absolute left-4 top-4 z-10 rounded-full border border-white/10 bg-black/60 px-4 py-2 text-sm font-medium text-white shadow-lg backdrop-blur-md";

  return (
    <main className="min-h-screen overflow-hidden bg-[#050507] px-6 py-24 text-white">
      <section className="container relative mx-auto max-w-6xl">
        <div className="absolute -top-32 left-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute right-0 top-40 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute bottom-40 left-1/3 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative mb-16 rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/50 backdrop-blur-xl">
          <p className="mb-3 w-fit rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm text-primary">
            Raspberry Pi • AI • Physical Computing
          </p>

          <h1 className="mb-4 text-5xl font-bold tracking-tight md:text-7xl">
            D.A.N.I.E.L.
          </h1>

          <p className="max-w-3xl text-lg leading-relaxed text-white/70">
            Digital Autonomous Networked Intelligence Engine Link. A physical
            voice controlled AI desk assistant built to make artificial
            intelligence feel present, approachable, and human.
          </p>
        </div>

        <div className="relative mb-20 grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className={mediaCard}>
            <span className={label}>Build process photos</span>
            <img
              src="/dan2.png"
              alt="D.A.N.I.E.L. build process"
              className="h-full w-full object-cover transition duration-500 hover:scale-105"
            />
          </div>

          <div className={mediaCard}>
            <span className={label}>Interaction diagram</span>
            <img
              src="/dan1.jpeg"
              alt="D.A.N.I.E.L. interaction diagram"
              className="h-full w-full object-cover transition duration-500 hover:scale-105"
            />
          </div>
        </div>

        <div className="relative mb-20 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/50 backdrop-blur-xl">
          <h2 className="mb-6 text-3xl font-bold">Demo Videos</h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div className={mediaCard}>
              <span className={label}>Arabic interaction demo</span>
              <video controls className="w-full">
                <source src="/d1.mp4" type="video/mp4" />
              </video>
            </div>

            <div className={mediaCard}>
              <span className={label}>“What is your purpose?” demo</span>
              <video controls className="w-full">
                <source src="/demodan.mp4" type="video/mp4" />
              </video>
            </div>
          </div>

          <div className={`${mediaCard} mt-6`}>
            <span className={label}>Full YouTube demo</span>
            <iframe
              className="h-[420px] w-full"
              src="https://www.youtube.com/embed/CYNSQ_LMh7s"
              title="D.A.N.I.E.L. full demo"
              allowFullScreen
            />
          </div>
        </div>

        <div className="relative mb-20 grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-xl backdrop-blur-xl">
            <h3 className="mb-3 text-xl font-semibold">Interaction</h3>
            <p className="text-sm leading-relaxed text-white/65">
              Press and hold the button to record. Release to process. D.A.N.I.E.L.
              listens, thinks, then speaks back out loud.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-xl backdrop-blur-xl">
            <h3 className="mb-3 text-xl font-semibold">My Role</h3>
            <p className="text-sm leading-relaxed text-white/65">
              I handled the Raspberry Pi setup, wiring, button input, microphone,
              AI logic, speech recognition, and text to speech pipeline.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-xl backdrop-blur-xl">
            <h3 className="mb-3 text-xl font-semibold">Owen’s Role</h3>
            <p className="text-sm leading-relaxed text-white/65">
              My partner Owen built the wooden enclosure, giving the project its
              handmade physical form and display object feel.
            </p>
          </div>
        </div>

        <div className="relative mb-20 rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/50 backdrop-blur-xl">
          <h2 className="mb-4 text-3xl font-bold">Concept</h2>
          <p className="mb-5 leading-relaxed text-white/70">
            D.A.N.I.E.L. began as a conversational assistant designed as a desk
            object that anyone could communicate with. The goal was not just to
            build something functional, but to rethink how people experience AI
            outside of screens.
          </p>
          <p className="leading-relaxed text-white/70">
            Instead of typing into a phone or computer, the assistant turns AI
            into something physical. It sits in your space, responds through
            voice, and invites interaction through a simple button based loop.
          </p>
        </div>

        <div className="relative mb-20 rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/50 backdrop-blur-xl">
          <h2 className="mb-6 text-3xl font-bold">Wiring Schematic</h2>

          <div className={mediaCard}>
            <span className={label}>Simple button wiring</span>
            <img
              src="/dan3.png"
              alt="D.A.N.I.E.L. wiring schematic"
              className="w-full object-contain"
            />
          </div>

          <p className="mt-5 text-sm leading-relaxed text-white/65">
            The wiring is intentionally simple. The push button connects GPIO17
            to ground using the Raspberry Pi’s internal pull up. Everything else,
            like the microphone and speakers, connects through USB and AUX.
          </p>
        </div>

        <div className="relative flex flex-wrap gap-4">
          <a
            href="https://github.com/Idreesnait/daniel-ai-assistant"
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground shadow-lg shadow-primary/20 transition hover:scale-105"
          >
            View Code
          </a>

          <a
            href="https://www.youtube.com/watch?v=CYNSQ_LMh7s"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/15 bg-white/5 px-6 py-3 font-medium text-white shadow-lg transition hover:scale-105 hover:bg-white/10"
          >
            Watch Full Demo
          </a>
        </div>
      </section>
    </main>
  );
}