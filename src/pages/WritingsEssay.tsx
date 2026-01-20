import { ArrowLeft } from "lucide-react";

export default function WritingsEssay() {
  return (
    <div className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <a
          href="/#projects"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </a>

        <div className="mt-8 rounded-2xl border bg-card/60 backdrop-blur p-6 md:p-12">
          <header className="mb-12">
            <p className="text-sm text-muted-foreground">
              PHIL 1000-004 · Oct 21, 2024
            </p>

            <h1 className="text-2xl md:text-3xl font-bold mt-3">
              Theory of Directed Bias in Ethical Systems
            </h1>

            <p className="text-muted-foreground mt-4">
              Harnessing Bias: A Philosophical Take on Fairness Through
              Self-Interest
            </p>

            <div className="mt-5 text-sm text-muted-foreground space-y-1">
              <div>Idrees J. Nait</div>
              <div>Professor Merily Salura</div>
            </div>
          </header>

          <article
            className="
              max-w-none
              space-y-6
              [&>p]:ml-6
              [&>p]:rounded-lg
              [&>p]:border
              [&>p]:bg-muted/40
              [&>p]:px-5
              [&>p]:py-4
              [&>p]:indent-6
              [&>p]:leading-relaxed
              [&>h2]:mt-14
              [&>h2]:mb-6
              [&>h2]:font-bold
              [&>h2]:text-lg
            "
          >
            <p>
              To make fair decisions, we might think about eliminating personal
              bias and self-interest. But what if fairness requires embracing
              this very nature? This theory proposes that individual bias, when
              directed through a structured ignorance of personal position,
              creates fairer systems. The Theory of Directed Bias draws on
              Rawls’ Veil of Ignorance, suggesting that ethical systems should
              leverage, not eliminate, self-interest by incorporating
              uncertainty about one’s role.
            </p>

            <p>
              In pursuing fair systems, whether in laws, institutions, or
              competitive contexts, we usually assume that justice means
              removing all personal bias. However, I propose an alternative
              approach: by structuring self-interest through directed bias,
              where we lack knowledge of our own position, we can achieve
              fairer and more resilient ethical systems.
            </p>

            <p>
              Universal consensus on ethics is ultimately an impossible goal.
              Values, cultures, and individual beliefs vary too widely. Yet
              personal reassurance, a sense of ethical grounding within one’s
              own principles, is almost inevitable. This thesis explores whether
              ethics grounded in personal alignment can still generate systems
              that foster practical fairness across diverse communities.
            </p>

            <h2>Human Nature and Self-Interest Redefined</h2>

            <p>
              Imagine designing the rules for a survival game without knowing
              your role. You could end up as the well-resourced competitor or
              the underdog. Naturally, you would ensure fair rules for all,
              anticipating that you might be disadvantaged.
            </p>

            <p>
              The notion that human nature is self-serving often appears
              incompatible with fairness. Traditional ethical frameworks tend
              to prioritize abstract moral duties over personal motivation.
              Rawls challenges this by suggesting that uncertainty aligns
              self-interest with fairness, creating systems that protect all
              participants.
            </p>

            <h2>Bias as a Constructive Ethical Tool Via Awareness</h2>

            <p>
              Imagine a village isolated by miles of desert, controlling the
              only water source for hundreds of miles. Faced with crisis, the
              village leader must decide whether to share water or preserve it
              solely for survival.
            </p>

            <p>
              Bound by personal awareness, the leader feels obligated to
              protect the village alone. Yet awareness of suffering beyond
              their borders introduces moral tension. This conflict reveals
              how personal awareness both limits and motivates ethical action.
            </p>

            <p>
              Ultimately, prioritizing survival exposes a limitation: isolation
              weakens long-term resilience. Directed bias offers a remedy by
              aligning self-preservation with shared survival.
            </p>

            <h2>Uncertainty as the Pathway to Fairness</h2>

            <p>
              The veil of ignorance introduces uncertainty, urging decisions
              that serve all positions within a system. Fairness becomes less
              about altruism and more about safeguarding against disadvantage.
            </p>

            <p>
              In policymaking, designing rules without assuming one’s position
              encourages inclusive protection. This absence of personal
              knowledge establishes fairness as a baseline rather than an
              abstract ideal.
            </p>

            <h2>Counterarguments</h2>

            <p>
              Critics argue that ethics grounded in self-interest undermine
              moral purity. Kantian ethics demands duty, while utilitarianism
              prioritizes aggregate good. Yet denying self-interest ignores
              human reality. Directed bias acknowledges this reality and
              channels it toward fairness.
            </p>

            <h2>Practical Implications</h2>

            <p>
              Directed bias applies directly to justice, policy-making, and
              competitive systems. When individuals assume they may be subject
              to the rules they create, systems become more inclusive and
              resilient.
            </p>

            <h2>Conclusion</h2>

            <p>
              By embracing self-interest through structured uncertainty,
              directed bias reframes fairness as an outcome of human nature
              rather than its denial. In doing so, ethical systems become both
              realistic and just.
            </p>

            <h2>Footnotes</h2>

            <p>
              <strong>Inspiration:</strong> This theory emerged from an idea
              that initially felt contradictory: that bias could function as
              a tool for fairness rather than an obstacle.
            </p>

            <p>
              <strong>AI Implementations:</strong> Grammar assistance, clarity
              review, and citation support.
            </p>

            <p>
              <strong>References:</strong>
              <ul className="ml-10 list-disc space-y-1">
              <li>Rawls, John. <em>A Theory of Justice</em>.</li>
              <li>Mill, John Stuart. <em>Utilitarianism</em>.</li>
              <li>Kant, Immanuel. <em>Groundwork for the Metaphysics of Morals</em>.</li>
              <li>Sen, Amartya. <em>The Idea of Justice</em>.</li>
            </ul>
            </p>

            
          </article>

          <footer className="mt-14 pt-6 border-t text-xs text-muted-foreground">
            <div className="space-y-1">
              <div>All rights reserved — Idrees J. Nait</div>
              <div>2024 · PHIL 1000-004</div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
