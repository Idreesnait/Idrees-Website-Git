import { useEffect, useState } from "react";
import Project1 from "./Project1";
import Project2 from "./Project2";
import Project3 from "./Project3";
import Project4 from "./Project4";
import Project5 from "./Project5";
import Project6 from "./Project6";
import Project7 from "./Project7";

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
      <nav className="fixed right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
        {projects.map((p) => (
          <a
            key={p.id}
            href={`#${p.id}`}
            className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-all ${
              active === p.id
                ? "bg-teal-500 text-white shadow-lg scale-105"
                : "bg-white/60 text-muted-foreground hover:bg-teal-100 hover:text-teal-700"
            }`}
          >
            {p.number}
          </a>
        ))}
      </nav>

      <main className="px-6 py-24 max-w-6xl mx-auto">
        <header className="text-center mb-32">
          <h1 className="text-5xl font-bold mb-6">
            Object 3300 Documentation
          </h1>
          <p className="max-w-3xl mx-auto text-muted-foreground text-lg">
            A living record of my process, experiments, failures, and outcomes
            in ATLS 3300.
          </p>
        </header>

        <div className="space-y-32">
          {projects.map((p) => (
            <section key={p.id} id={p.id} className="scroll-mt-32">
              <div className="rounded-3xl border border-teal-200/60 bg-white/70 backdrop-blur-xl shadow-xl px-10 py-12">
                <h2 className="text-3xl font-semibold mb-10 text-teal-700">
                  Project {p.number}
                </h2>

                <div className="space-y-10 text-muted-foreground">
  {p.number === 1 ? (
  <Project1 />
) : p.number === 2 ? (
  <Project2 />
) : p.number === 3 ? (
  <Project3 />
) : p.number === 4 ? (
  <Project4 />
) : p.number === 5 ? (
  <Project5 />
) : p.number === 6 ? (
  <Project6 />
) : p.number === 7 ? (
  <Project7 />
) : (
                    <>
                      <div>
                        <h3 className="font-medium text-foreground">
                          Overview
                        </h3>
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">
                          Process & Experiments
                        </h3>
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">
                          How It Works
                        </h3>
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">
                          Materials
                        </h3>
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">
                          Images & Video
                        </h3>
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">
                          Code
                        </h3>
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">
                          References & Sources
                        </h3>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}