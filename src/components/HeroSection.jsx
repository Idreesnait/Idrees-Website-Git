import { ArrowDown } from "lucide-react";

export const HeroSection = () => {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center px-4"
    >
      <div className="container max-w-4xl mx-auto text-center z-10">
        <div className="space-y-6">
          <img
            src="/me.jpeg"
            alt="Idrees Nait"
            className="w-50 h-50 md:w-44 md:h-44 mx-auto rounded-full object-cover border-2 border-primary opacity-0 animate-fade-in shadow-[0_0_20px_rgba(251,146,60,0.4)]"
          />

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            <span className="opacity-0 animate-fade-in">Hello, I am</span>
            <span className="text-primary opacity-0 animate-fade-in-delay-1">
              {" "}
              Idrees
            </span>
            <span className="ml-2 opacity-0 animate-fade-in-delay-2">
              {" "}
              Nait
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto opacity-0 animate-fade-in-delay-3">
            I’m an interdisciplinary creative technologist and digital artist. I
            design and build experiences that blend strong visuals with systems
            that actually work.
          </p>

          <div className="pt-4 opacity-0 animate-fade-in-delay-4">
            <a href="#projects" className="cosmic-button">
              View My Work
            </a>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce">
        <span className="text-sm text-muted-foreground mb-2">Scroll</span>
        <ArrowDown className="h-5 w-5 text-primary" />
      </div>
    </section>
  );
};
