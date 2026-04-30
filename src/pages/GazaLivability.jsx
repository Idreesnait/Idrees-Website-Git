export default function GazaLivability() {
  return (
    <main className="min-h-screen bg-[#050507] px-6 py-24 text-white overflow-hidden">
      <section className="container relative mx-auto max-w-5xl">
        <div className="absolute -top-28 left-10 h-72 w-72 rounded-full bg-red-500/20 blur-3xl" />
        <div className="absolute right-0 top-40 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="absolute bottom-20 left-1/3 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

        <div className="relative mb-10 rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/50 backdrop-blur-xl">
          <p className="mb-3 w-fit rounded-full border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
            Explainer Video • Procreate • After Effects
          </p>

          <h1 className="mb-4 text-4xl font-bold md:text-6xl">
            Livability in Gaza
          </h1>

          <p className="max-w-3xl text-white/70 leading-relaxed">
            This explainer video examines the current state of livability in Gaza
            by translating difficult statistics into visual storytelling. The
            animation combines hand drawn Procreate frame animation with Adobe
            After Effects vector motion to make the scale of daily conditions
            easier to understand.
          </p>
        </div>

        <div className="relative rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/50 backdrop-blur-xl">
          <span className="absolute left-8 top-8 z-10 rounded-full border border-white/10 bg-black/60 px-4 py-2 text-sm text-white shadow-lg backdrop-blur-md">
            Final video
          </span>

          <video
            controls
            className="w-full rounded-3xl shadow-2xl shadow-black/60"
          >
            <source src="/Final Cut.mp4" type="video/mp4" />
          </video>
        </div>
      </section>
    </main>
  );
}