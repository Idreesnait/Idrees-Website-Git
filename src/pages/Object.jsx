import { useEffect, useState } from "react";

const projects = Array.from({ length: 9 }, (_, i) => ({
  id: `project-${i + 1}`,
  number: i + 1,
}));

export default function Object() {
  const [active, setActive] = useState("project-1");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { threshold: 0.4 }
    );

    projects.forEach((p) => {
      const el = document.getElementById(p.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#e6f7f5] via-background to-[#eaf6ef] text-foreground">
      {/* Floating right nav */}
      <nav className="fixed right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
        {projects.map((p) => (
          <a
            key={p.id}
            href={`#${p.id}`}
            className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-all
              ${
                active === p.id
                  ? "bg-teal-500 text-white shadow-lg scale-105"
                  : "bg-white/60 text-muted-foreground hover:bg-teal-100 hover:text-teal-700"
              }`}
          >
            {p.number}
          </a>
        ))}
      </nav>

      {/* Main content */}
      <main className="px-6 py-24 max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-32">
          <h1 className="text-5xl font-bold mb-6">
            Object 3300 Documentation
          </h1>
          <p className="max-w-3xl mx-auto text-muted-foreground text-lg">
            A living record of my process, experiments, failures, and outcomes in ATLS 3300.
            
          </p>
        </header>

        {/* Project sections */}
        <div className="space-y-32">
          {projects.map((p) => (
            <section
              key={p.id}
              id={p.id}
              className="scroll-mt-32"
            >
              <div className="rounded-3xl border border-teal-200/60 bg-white/70 backdrop-blur-xl shadow-xl shadow-teal-200/30 px-10 py-12">
                <h2 className="text-3xl font-semibold mb-10 text-teal-700">
                  Project {p.number}
                </h2>

                <div className="space-y-10 text-muted-foreground">
                  {/* OVERVIEW */}
                  <div>
                    <h3 className="font-medium text-foreground mb-2">
                      Overview
                    </h3>
                    {/* Write a brief description of what the project is and what it does */}
                  </div>

                  {/* PROCESS */}
                  <div>
                    <h3 className="font-medium text-foreground mb-2">
                      Process & Experiments
                    </h3>
                    {/* Document iterations, failures, tests, and unexpected outcomes */}
                  </div>

                  {/* SYSTEM */}
                  <div>
                    <h3 className="font-medium text-foreground mb-2">
                      How It Works
                    </h3>
                    {/* Explain system logic, components, diagrams, and data flow */}
                  </div>

                  {/* MATERIALS */}
                  <div>
                    <h3 className="font-medium text-foreground mb-2">
                      Materials
                    </h3>
                    {/* List materials, sensors, tools, fabrication methods */}
                  </div>

                  {/* MEDIA */}
                  <div>
                    <h3 className="font-medium text-foreground mb-2">
                      Images & Video
                    </h3>
                    {/* Insert photos, sketches, diagrams, and embedded videos */}
                  </div>

                  {/* CODE */}
                  <div>
                    <h3 className="font-medium text-foreground mb-2">
                      Code
                    </h3>
                    {/* Link to GitHub repo or Gist with commented code */}
                  </div>

                  {/* REFERENCES */}
                  <div>
                    <h3 className="font-medium text-foreground mb-2">
                      References & Sources
                    </h3>
                    {/* Cite inspirations, tutorials, libraries, techniques */}
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
