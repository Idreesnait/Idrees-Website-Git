import { Briefcase, Code, Palette, GraduationCap } from "lucide-react";

export const AboutSection = () => {
  return (
    <section id="about" className="py-24 px-4 relative">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
          About <span className="text-primary">Me</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* LEFT */}
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold">
              Interdisciplinary Creative Technologist 
            </h3>

            <p className="text-muted-foreground">
              I’m a third-year Creative Technology and Design student in the
              School of Engineering and Applied Sciences at the University of
              Colorado Boulder. Graduation Date: May 2027
            </p>

            <p className="text-muted-foreground">
              I grew up in Qatar, surrounded by a culture driven to build a
              future that is equally functional and beautiful. That environment
              shaped how I see design. Not as decoration, but as a system that
              should work, feel intentional, and invite peoples interest.
            </p>

            <p className="text-muted-foreground">
              I began as a fine artist, drawn not just to visuals, but to
              interaction, how things respond, behave, and evolve. My work has evolved in a comfort in the weird, honing
             possibly destructive obsessions into a focused and creative workflow.
            </p>

            <h4 className="text-xl font-semibold pt-4">Design Philosophy</h4>

            <p className="text-muted-foreground">
              Design is a progressive act. It questions norms, embraces
              experimentation, and proposes futures that are better than where
              they began. I believe the strongest work balances clarity with
              mystery. Though this must be buildable, functional, replicatable,
              and even a bit strange.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
              <a href="#contact" className="cosmic-button">
                Get In Touch
              </a>
            </div>
          </div>

          {/* RIGHT */}
          <div className="grid grid-cols-1 gap-6">
            <div className="gradient-border p-6 card-hover">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Palette className="h-6 w-6 text-primary" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-lg">Fine Art</h4>
                  <p className="text-muted-foreground">
                    Creating visual work that explores form, emotion, and
                    experimentation across digital and physical media.
                  </p>
                </div>
              </div>
            </div>

            <div className="gradient-border p-6 card-hover">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Code className="h-6 w-6 text-primary" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-lg">UI/UX Design</h4>
                  <p className="text-muted-foreground">
                    Designing intuitive user interfaces and seamless user
                    experiences.
                  </p>
                </div>
              </div>
            </div>

            <div className="gradient-border p-6 card-hover">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-lg">Product Design</h4>
                  <p className="text-muted-foreground">
                    Shaping ideas into usable products through iteration,
                    systems thinking, and intentional design decisions.
                  </p>
                </div>
              </div>
            </div>

            <div className="gradient-border p-6 card-hover">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-lg">CU Boulder Student | Major GPA: 3.94</h4>
                  <p className="text-muted-foreground">
                    Studying Creative Technology and Design at the University of
                    Colorado Boulder within the School of Engineering and
                    Applied Sciences. 
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* END RIGHT */}
        </div>
      </div>
    </section>
  );
};
