export default function ChainsawMan() {
  return (
    <main className="min-h-screen bg-[#050507] px-6 py-24 text-white overflow-hidden">
      <section className="container relative mx-auto max-w-5xl">

        {/* background glow */}
        <div className="absolute -top-24 left-10 h-72 w-72 rounded-full bg-red-500/20 blur-3xl" />
        <div className="absolute right-0 top-40 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />

        {/* header */}
        <div className="relative mb-10 rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-2xl backdrop-blur-xl">
          <p className="mb-3 w-fit rounded-full border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
            Motion • Animation • Study
          </p>

          <h1 className="mb-4 text-4xl font-bold md:text-6xl">
            Chainsaw Man Animation Study
          </h1>

          <p className="max-w-3xl text-white/70 leading-relaxed">
            This was my first animation project, created by studying and
            referencing scenes from Chainsaw Man to understand timing,
            motion, and visual rhythm. Instead of copying directly, I used
            the source material to build a new shot that reflects my own
            interpretation while staying true to the style.
          </p>
        </div>

        {/* video */}
        <div className="relative rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl backdrop-blur-xl">
          <span className="absolute left-8 top-8 z-10 rounded-full border border-white/10 bg-black/60 px-4 py-2 text-sm text-white backdrop-blur-md">
            Final animation
          </span>

          <video
            controls
            className="w-full rounded-3xl shadow-2xl"
          >
            <source src="/CSM.mov" type="video/mp4" />
          </video>
        </div>

      </section>
    </main>
  );
}