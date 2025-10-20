import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Pie, PieChart, BarChart, Cell, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const formatCharacterCount = (value: string) =>
  new Intl.NumberFormat().format(value.length);

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#a4de6c", "#d0ed57"];

const samplePrompts = [
  "Capture your headline introduction",
  "Outline a key objective",
  "Share a personal welcome message",
];

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
        const response = await fetch("http://localhost:8000/api/analyze", {
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

                {/* Summary */}
                <div><strong>Summary:</strong> {analysis.summary}</div>

                {/* Emotions: So this is a test for the chart itself. In the next sprints I think we want to move to a dashboard
                that displays all the information so it's not so cluttered; but for now, I think this is a decent demo for now.*/}
                <div>
                  <strong>Emotions:</strong>
                  <ul className="mt-2 space-y-1">
                    {analysis.emotion?.map((e: any, idx: number) => (
                      <li key={idx}>
                        {e.label}: {e.score.toFixed(3)}
                      </li>
                    ))}
                  </ul>

                  {/* Chart */}
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold mb-2">Emotion Scores</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Tooltip />
                        <Pie
                          data={analysis.emotion}
                          dataKey="score"
                          nameKey="label"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(1)}%`
                          }
                        >
                          {analysis.emotion.map((entry: any, index: number) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]} // cycles through the color list
                            />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Political Bias */}
                {/* <p><strong>Political Bias:</strong> {JSON.stringify(analysis.political_bias)}</p> */}
                <div>
                  <strong>Political Bias:</strong>
                  <ul className="mt-2 space-y-1">
                    {Object.entries(analysis.political_bias || {}).map(([label, value], idx) => (
                      <li key={idx}>
                        {label}: {value.toFixed(3)}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold mb-2">Political Bias Scores</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={Object.entries(analysis.political_bias || {}).map(([label, value]) => ({
                          label,
                          score: value,
                        }))}
                      >
                        <XAxis dataKey="label" />
                        <YAxis domain={[0, 1]} />
                        <Tooltip />
                        <Bar dataKey="score" fill="#82ca9d" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Toxicity */}
                {/* <p><strong>Toxicity:</strong> {JSON.stringify(analysis.toxicity)}</p> */}
                <div>
                  <strong>Toxicity:</strong>
                  <ul className="mt-2 space-y-1">
                    {Object.entries(analysis.toxicity || {}).map(([label, value], idx) => (
                      <li key={idx}>
                        {label}: {value.toFixed(3)}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold mb-2">Toxicity Scores</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={Object.entries(analysis.toxicity || {}).map(([label, value]) => ({
                          label,
                          score: value,
                        }))}
                      >
                        <XAxis dataKey="label" />
                        <YAxis domain={[0, 1]} />
                        <Tooltip />
                        <Bar dataKey="score" fill="#ff6b6b" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
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
