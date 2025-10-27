import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";

const formatCharacterCount = (value: string) =>
  new Intl.NumberFormat().format(value.length);

const samplePrompts = [
  "Capture your headline introduction",
  "Outline a key objective",
  "Share a personal welcome message",
];

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const Main = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const entry = useMemo(() => searchParams.get("entry")?.trim() ?? "", [searchParams]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const characterCount = useMemo(() => formatCharacterCount(entry), [entry]);

  const wordCount = useMemo(() => {
    if (!entry) return "0";
    const words = entry.split(/\s+/).filter(Boolean).length;
    return new Intl.NumberFormat().format(words);
  }, [entry]);

  const handleCreateAnother = () => {
    navigate("/");
  };

  // Fetch analysis results from backend
  useEffect(() => {
    if (!entry) return;

    const analyzeText = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE}/api/analyze`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: entry }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setAnalysis(data);
      } catch (err: any) {
        setError("Failed to fetch analysis results. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    analyzeText();
  }, [entry]);

  return (
    <AppLayout contentClassName="flex flex-col items-center pb-24">
      <section className="w-full max-w-4xl space-y-10 text-center">
        <div className="flex flex-col gap-4">
          <span className="mx-auto inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent">
            Text Analysis
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            AI Analysis Results
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-foreground/70">
            See how your submitted text is interpreted across sentiment, toxicity, and bias.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/80 p-10 text-left shadow-xl backdrop-blur-2xl">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground/60">
                Submitted content
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-foreground">
                {entry ? "Live preview" : "Awaiting input"}
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
            {entry ? <p>{entry}</p> : <p className="text-foreground/60">No text provided.</p>}
          </article>

          <div className="mt-8 space-y-4">
            {loading && <p className="text-center text-emerald-600">Analyzing...</p>}
            {error && <p className="text-center text-red-600">{error}</p>}

            {analysis && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Analysis Results</h3>
                <p><strong>Emotion:</strong> {analysis.emotion?.label} ({analysis.emotion?.score?.toFixed(3)})</p>
                <p><strong>Summary:</strong> {analysis.summary}</p>
                <p><strong>Political Bias:</strong> {JSON.stringify(analysis.political_bias)}</p>
                <p><strong>Toxicity:</strong> {JSON.stringify(analysis.toxicity)}</p>
              </div>
            )}
          </div>

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
