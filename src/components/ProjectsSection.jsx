import { useState } from "react";
import { cn } from "@/lib/utils";
import { ArrowRight, ExternalLink, Github } from "lucide-react";

const projects = [
  // ===== MOTION =====
  {
    id: 1,
    title: "Chainsaw Man – Fan Animation Practice",
    description:
      "My first animation—created by referencing existing Chainsaw Man footage to study timing, motion, and stylizing a new shot inspired by my favorite manga series.",
    image: "/CSMT.jpg",
    tags: ["Motion", "Animation"],
    category: "motion",
    demoUrl: "/CSM.mov",
    githubUrl: "",
  },
  {
    id: 2,
    title: "Brain Predictability (Animation)",
    description:
      "A 1-minute animation exploring why the brain prioritizes predictability over what’s objectively good.",
    image: "/YTT.jpg",
    tags: ["Motion", "Storytelling"],
    category: "motion",
    demoUrl: "https://www.youtube.com/watch?v=T0dbu8Tzhr8",
    githubUrl: "",
  },

  // ===== UI / UX =====
  {
    id: 3,
    title: "Buff Portal – Homepage Redesign (Figma)",
    description:
      "Redesigned CU Boulder’s student portal homepage to prevent accidental calendar interactions, reduce scrolling, prioritize favorited items, and show a full 7-day week for easier schedule screenshots.",
    image: "/FT.jpg",
    tags: ["UI/UX", "Figma", "Redesign"],
    category: "ui/ux",
    demoUrl:
      "https://www.figma.com/design/Hb0vEbKAkkvYvHQ0YfIMWi/Buff-Portal-redesign?node-id=0-1&p=f&t=6vGCfwlRFuVDnJ9B-0",
    githubUrl: "",
  },

  // ===== VISUAL ART / DRAWINGS =====
  { id: 4, image: "/d1.jpeg", category: "visual art" },
  { id: 5, image: "/d2.jpeg", category: "visual art" },
  { id: 6, image: "/d3.jpeg", category: "visual art" },
  { id: 7, image: "/d4.jpeg", category: "visual art" },
  { id: 8, image: "/d5.jpeg", category: "visual art" },

  // ===== GRAPHIC DESIGN (FLATIRONS) =====
  {
    id: 9,
    title: "Flatirons Church – Graphic Design",
    description: "Graphic design work created for Flatirons Church.",
    image: "/GD.jpeg",
    tags: ["Graphic Design"],
    category: "visual art",
    demoUrl: "",
    githubUrl: "",
  },
  {
    id: 10,
    title: "Flatirons Church – Graphic Design",
    description: "Graphic design work created for Flatirons Church.",
    image: "/GD2.jpeg",
    tags: ["Graphic Design"],
    category: "visual art",
    demoUrl: "",
    githubUrl: "",
  },
];

const categories = ["all", "ui/ux", "motion", "3d", "games", "visual art"];

export const ProjectsSection = () => {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredProjects = projects.filter(
    (p) => activeCategory === "all" || p.category === activeCategory
  );

  return (
    <section id="projects" className="py-24 px-4 relative">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          Featured <span className="text-primary">Projects</span>
        </h2>

        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          A mix of UI/UX, motion, and visual work—built fast, iterated hard.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={cn(
                "px-5 py-2 rounded-full transition-colors duration-300 capitalize",
                activeCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/70 text-foreground hover:bg-secondary"
              )}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group bg-card rounded-lg overflow-hidden shadow-xs card-hover"
            >
              {/* Portrait-friendly image frame: shows full 8x11-ish art */}
              <div className="aspect-[4/5] overflow-hidden bg-secondary/20">
                <img
                  src={project.image}
                  alt={project.title || "Project image"}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Only show the content block if there is content */}
              {(project.title ||
                project.description ||
                (project.tags && project.tags.length > 0) ||
                project.demoUrl ||
                project.githubUrl) && (
                <div className="p-6">
                  {project.tags?.length ? (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs font-medium border rounded-full bg-secondary text-secondary-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  {project.title ? (
                    <h3 className="text-xl font-semibold mb-1">
                      {project.title}
                    </h3>
                  ) : null}

                  {project.description ? (
                    <p className="text-muted-foreground text-sm mb-4">
                      {project.description}
                    </p>
                  ) : null}

                  {(project.demoUrl || project.githubUrl) && (
                    <div className="flex space-x-3">
                      {project.demoUrl ? (
                        <a
                          href={project.demoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-foreground/80 hover:text-primary transition-colors duration-300"
                        >
                          <ExternalLink size={20} />
                        </a>
                      ) : null}

                      {project.githubUrl ? (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-foreground/80 hover:text-primary transition-colors duration-300"
                        >
                          <Github size={20} />
                        </a>
                      ) : null}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <a
            className="cosmic-button w-fit flex items-center mx-auto gap-2"
            target="_blank"
            rel="noreferrer"
            href="https://www.tiktok.com/@.barthholomule"
          >
            Check Out My TikTok <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
};
