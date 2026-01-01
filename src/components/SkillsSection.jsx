import { useState } from "react";
import { cn } from "@/lib/utils";

const skills = [
  // ===== FEATURED (summary-only) =====
  { name: "Programming", level: 65, category: "featured" },
  { name: "Fine Art", level: 90, category: "featured" },
    { name: "Adobe Creative Cloud", level: 85, category: "featured" },
  { name: "Prototyping", level: 80, category: "featured" },

  // ===== FRONTEND =====
  { name: "HTML", level: 70, category: "frontend" },
  { name: "JavaScript", level: 70, category: "frontend" },
  { name: "Framer", level: 80, category: "frontend" },

  // ===== BACKEND =====
  { name: "C++", level: 40, category: "backend" },

  // ===== ANIMATION =====
  { name: "Procreate Dreams", level: 80, category: "animation" },
  { name: "After Effects", level: 70, category: "animation" },
  { name: "Premiere Pro", level: 70, category: "animation" },

  // ===== FINE ART =====
  { name: "Hand Drawing", level: 90, category: "fine art" },
  { name: "Procreate", level: 100, category: "fine art" },
  { name: "Adobe Creative Cloud", level: 80, category: "fine art" },

  // ===== TOOLS =====
  { name: "GitHub", level: 90, category: "tools" },
  { name: "Figma", level: 95, category: "tools" },
  { name: "SOLIDWORKS (CSWA)", level: 90, category: "tools" },
  { name: "Onshape", level: 80, category: "tools" },
  { name: "SketchUp", level: 90, category: "tools" },
  { name: "Exel", level: 70, category: "tools" },
];

const categories = [
  "featured",
  "frontend",
  "backend",
  "animation",
  "fine art",
  "tools",
];

export const SkillsSection = () => {
  const [activeCategory, setActiveCategory] = useState("featured");

  const filteredSkills = skills.filter(
    (skill) => skill.category === activeCategory
  );

  return (
    <section id="skills" className="py-24 px-4 relative bg-secondary/30">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
          My <span className="text-primary">Skills</span>
        </h2>

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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSkills.map((skill, key) => (
            <div
              key={key}
              className="bg-card p-6 rounded-lg shadow-xs card-hover"
            >
              <div className="text-left mb-4">
                <h3 className="font-semibold text-lg">{skill.name}</h3>
              </div>

              <div className="w-full bg-secondary/50 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-2 rounded-full origin-left animate-[grow_1.5s_ease-out]"
                  style={{ width: skill.level + "%" }}
                />
              </div>

              <div className="text-right mt-1">
                <span className="text-sm text-muted-foreground">
                  {skill.level}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
