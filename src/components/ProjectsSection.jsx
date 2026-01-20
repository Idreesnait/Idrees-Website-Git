import { useState } from "react";
import { cn } from "@/lib/utils";
import { ArrowRight, ExternalLink, Github } from "lucide-react";

const projects = [
  // ===== FEATURED =====
{
  id: 300, // different id
  title: "Survivor Arena",
  description:
    "Survivor Arena started as a “what if I just made a game?” moment and turned into a top-down survival mess where you dodge swarms, auto-shoot everything, grab drops, and stack upgrades until things get unfair (for you). It’s chaotic, simple, and very much a product of me getting bored on a rainny day and deciding to build something.",
  image: "/g1.jpeg",
  tags: ["Game", "Product Thinking", "UI/UX"],
  category: "featured",
  demoUrl: "/games/signal-noise",
  githubUrl: "",
},
{
  id: 305, 
  image: "/d2.jpeg",
  category: "featured",
  tags: ["Sketching", "Inking", "Surrealism"],
  description: "I’ve been drawing for as long as I can remember, and for a couple years I became obsessed with pointillism and long hours of stippling. It slowed everything down and forced patience, since every image had to be built one mark at a time with no shortcuts. I think that’s why I stuck with it. The process felt quiet and focused, almost meditative. This piece came out of that period, with faces, flowers, and shadows layered until they start to blur together. It wasn’t about trying to make something deep, just spending enough time with the drawing until it became dense and heavy in its own way.",
},
{
  id: 412, 
  title: "Balsa Wood Truss Bridge",
  description:
    "A balsa wood truss bridge made from balsa wood, designed to efficiently carry load through a truss structure. Won first place at the Freshman Engineering Expo.",
  image: "/Bridge.jpeg",
  tags: ["Civil Engineering", "Structures", "Prototyping"],
  category: "featured",
  demoUrl: "/124.pdf",
  githubUrl: "",
},




    { id: 5, image: "/d2.jpeg", category: "Featured" },



  // ===== MOTION =====
  {
    id: 1,
    title: "Chainsaw Man – Fan Animation Practice",
    description:
      "My first animation—created by referencing existing Chainsaw Man footage to study timing, motion, and stylizing a new shot inspired by my favorite manga series.",
    image: "/CSMT.jpg",
    tags: ["Motion", "2d Animation"],
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
      "https://www.figma.com/design/Hb0vEbKAkkvYvHQ0YfIMWi/Buff-Portal-redesign",
    githubUrl: "",
  },

  // ===== 3D =====
  {
    id: 9,
    title: "Mango Energy Drink",
    description:
      "A 3D modeled concept can exploring form, materials, and branding presence.",
    image: "/m1.jpeg",
    tags: ["3D", "Modeling"],
    category: "3d",
    demoUrl: "",
    githubUrl: "",
  },
  {
    id: 10,
    title: "Packaging Die Cut | Mango Energy Drink",
    description:
      "Die cut layout and packaging structure exploration for a branded multi-pack concept.",
    image: "/m2.jpeg",
    tags: ["3D", "Packaging"],
    category: "3d",
    demoUrl: "",
    githubUrl: "",
  },
  {
    id: 11,
    title: "Graph Art | Generated From 3D Model",
    description:
      "Graphic art experimentation derived from the 3D model’s shapes and contours.",
    image: "/m3.jpeg",
    tags: ["3D", "Graphic Art"],
    category: "3d",
    demoUrl: "",
    githubUrl: "",
  }, 

  {
  id: 402,
  title: "Wooden Toy Biplane",
  description:
    "A wooden toy biplane model exploring form, object tolerancing, and material simplicity.",
  image: "/Toy.jpeg",
  tags: ["3D", "Modeling", "Wood"],
  category: "3d",
  demoUrl: "",
  githubUrl: "",
},
{
  id: 410,
  title: "Balsa Wood Truss Bridge",
  description:
    "A balsa wood truss bridge made from balsa wood, designed to efficiently carry load through a truss structure. Won first place at the Freshman Engineering Expo. Linked is the judge's feedback.",
  image: "/Bridge.jpeg",
  tags: ["Civil Engineering", "Structures", "Prototyping"],
  category: "3d",
  demoUrl: "/124.pdf",
  githubUrl: "",
},


  // ===== GAMES =====
  {
    id: 12,
    title: "Decision Engine",
    description:
      "An interactive product-decision simulator that lets you allocate limited effort each week and watch a complex system respond through tradeoffs, feedback loops, and unintended consequences.",
    image: "/g3.jpeg",
    tags: ["Game", "React", "Interaction"],
    category: "games",
    demoUrl: "/games/alien-reflex",
    githubUrl: "",
  },



  {
    id: 100,
    title: "Survivor Arena",
    description:
      "Survivor Arena is a top-down survival shooter where you dodge swarms while auto-shooting, collecting drops, and building upgrades between levels. Survive longer, stack buffs/abilities, and chase your run’s high score.",
    image: "/g1.jpeg", // use any placeholder image for now
    tags: ["Game", "Product Thinking", "UI/UX"],
    category: "games",
    demoUrl: "/games/signal-noise",
    githubUrl: "",
  },

  // ===== WRITING =====
  {
    id: 200,
    title: "Theory of Directed Bias in Ethical Systems",
    description:
      "PHIL 1000 essay exploring fairness through self-interest, drawing on Rawls’ Veil of Ignorance and structured uncertainty.",
    image: "/w2.jpeg", 
    tags: ["Writing", "Philosophy", "Ethics"],
    category: "writings",
    demoUrl: "/writings/directed-bias",
    githubUrl: "",
  },
  {
  id: 201,
  title: "Letter to Donna Haraway",
  description:
    "A speculative fiction essay inspired by Donna Haraway, imagining a posthumous world where one of her intellectual descendants witnesses the consequences of cyborg theory made real. Told as a letter from Lilith to Haraway, the piece explores grief, care, epiphylogenesis, and the strategic use of emotion in human–AI relationships, questioning whether feeling leads to ethics, or merely optimization.",
  image: "/w5.jpeg",
  tags: ["Writing", "Philosophy", "Narrative"],
  category: "writings",
  demoUrl: "/writings/essay-2",
  githubUrl: "",
},


  // ===== VISUAL ART =====
{ id: 4, image: "/d1.jpeg", category: "visual art", tags: ["Inking", "Expressionism", "Pointillism"] },
{ id: 5, image: "/d2.jpeg", category: "visual art", tags: ["Inking", "Expressionism", "Pointillism"] },
{ id: 7, image: "/d7.jpeg", category: "visual art", tags: ["Inking", "Expressionism", "Pointillism"] },
{ id: 420, image: "/da1.jpeg", category: "visual art", tags: ["Photoshop", "Procreate"] },
{ id: 423, image: "/da2.jpeg", category: "visual art", tags: ["Photoshop", "Procreate"] },
{ id: 422, image: "/atlas.jpeg", category: "visual art", tags: ["Procreate"] },




// ===== OBJECT ===== 
  {
  id: 401,
  title: "Object Blog",
  description:
    "Documentation for Object 3300.",
  image: "/A13.jpeg",
  tags: ["OOP", "Documentation", "College"],
  category: "object",
  demoUrl: "/object",
  githubUrl: "",
},

];

const categories = [
  "featured",
  "ui/ux",
  "motion",
  "3d",
  "games",
  "writings",
  "visual art",
  "object",
];

export const ProjectsSection = () => {
  const [activeCategory, setActiveCategory] = useState("featured");

const filteredProjects = projects.filter((p) => {
  if (activeCategory === "featured") {
    return p.category === "featured";
  }
  return p.category === activeCategory;
});


  return (
    <section id="projects" className="py-24 px-4 relative">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          Creative <span className="text-primary">Projects</span>
        </h2>

        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          A mix of professional design and creative work
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

        <p className="text-center text-xs text-muted-foreground mb-12">
          more projects on the way - added weekly 
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group bg-card rounded-lg overflow-hidden shadow-xs card-hover"
            >
              <div className="aspect-[4/5] overflow-hidden bg-secondary/20">
                <img
                  src={project.image}
                  alt={project.title || "Project image"}
                  className="w-full h-full object-contain"
                />
              </div>

              {(project.title ||
                project.description ||
                project.tags?.length ||
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

                  {project.title && (
                    <h3 className="text-xl font-semibold mb-1">
                      {project.title}
                    </h3>
                  )}

                  {project.description && (
                    <p className="text-muted-foreground text-sm mb-4">
                      {project.description}
                    </p>
                  )}

                  {(project.demoUrl || project.githubUrl) && (
                    <div className="flex space-x-3">
                      {project.demoUrl &&
                        (project.demoUrl.startsWith("/") ? (
                          <a
                            href={project.demoUrl}
                            className="text-foreground/80 hover:text-primary transition-colors duration-300"
                          >
                            <ExternalLink size={20} />
                          </a>
                        ) : (
                          <a
                            href={project.demoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-foreground/80 hover:text-primary transition-colors duration-300"
                          >
                            <ExternalLink size={20} />
                          </a>
                        ))}

                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-foreground/80 hover:text-primary transition-colors duration-300"
                        >
                          <Github size={20} />
                        </a>
                      )}
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
