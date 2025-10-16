import { useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";

const formatCharacterCount = (value: string) => new Intl.NumberFormat().format(value.length);

const samplePrompts = [
  "Capture your headline introduction",
  "Outline a key objective",
  "Share a personal welcome message",
];

const Main = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const entry = useMemo(() => searchParams.get("entry")?.trim() ?? "", [searchParams]);

  const characterCount = useMemo(() => formatCharacterCount(entry), [entry]);

  const wordCount = useMemo(() => {
    if (!entry) return "0";
    const words = entry.split(/\s+/).filter(Boolean).length;
    return new Intl.NumberFormat().format(words);
  }, [entry]);

  const handleCreateAnother = () => {
    navigate("/");
  };

  return (
    <AppLayout contentClassName="flex flex-col items-center pb-24">
      <section className="w-full max-w-4xl space-y-10 text-center">
        <div className="flex flex-col gap-4">
          <span className="mx-auto inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent">
            Main page ready
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            Your submitted text arrives polished and ready to review.
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-foreground/70">
            Explore the entry you just sent from the input page. Everything is preserved, paired with live insights that keep the content actionable.
          </p>
        </div>
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/80 p-10 text-left shadow-xl backdrop-blur-2xl">
          <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-accent/20 blur-3xl" aria-hidden />
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground/60">
                Submitted content
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-foreground">
                {entry ? "Live preview" : "Awaiting your first message"}
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-foreground/70 sm:flex sm:items-center sm:gap-10">
              <div>
                <span className="block text-xs uppercase tracking-[0.18em] text-foreground/50">
                  Characters
                </span>
                <span className="text-lg font-semibold text-foreground">{characterCount}</span>
              </div>
              <div>
                <span className="block text-xs uppercase tracking-[0.18em] text-foreground/50">
                  Words
                </span>
                <span className="text-lg font-semibold text-foreground">{wordCount}</span>
              </div>
            </div>
          </header>
          <article className="mt-8 rounded-3xl border border-primary/15 bg-white/90 p-6 text-base leading-relaxed text-foreground shadow-inner">
            {entry ? (
              <p>{entry}</p>
            ) : (
              <div className="space-y-4 text-foreground/60">
                <p>
                  Add a message on the input page to see it reflected here instantly, along with live analytics.
                </p>
                <ul className="list-disc space-y-2 pl-6">
                  {samplePrompts.map((prompt) => (
                    <li key={prompt}>{prompt}</li>
                  ))}
                </ul>
              </div>
            )}
          </article>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleCreateAnother}
              className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-5 py-2 text-sm font-semibold text-primary transition-colors duration-200 hover:border-primary hover:bg-primary/20"
            >
              Create another input
            </button>
            <Link
              to={entry ? `/main?entry=${encodeURIComponent(entry)}` : "/"}
              className="text-sm font-medium text-foreground/60 hover:text-primary"
            >
              Share link to this view
            </Link>
          </div>
        </div>
      </section>
    </AppLayout>
  );
};

export default Main;
