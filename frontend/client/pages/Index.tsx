/*

Index ("/") — Landing & Input

This page lets you paste or type content, 
choose what kinds of bias to check, set sensitivity, and start analysis.
On submit, it routes to “/main” with your input in the query string.

TODO: Connect the file upload button to backend API for text extraction.
*/

import { FormEvent, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import {
  FileText,
  Upload,
  AlertCircle,
  CheckCircle,
  Settings,
} from "lucide-react";
import { en } from "zod/v4/locales";

type BiasKeys = "sentiment" | "political" | "racial" | "gender";
type Sensitivity = "low" | "medium" | "high";

export default function Index() {
  const [entry, setEntry] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectedBiases, setSelectedBiases] = useState<
    Record<BiasKeys, boolean>
  >({
    sentiment: true,
    political: true,
    racial: false,
    gender: false,
  });
  const [sensitivity, setSensitivity] = useState<Sensitivity>("medium");

  const navigate = useNavigate();

  const wordCount = useMemo(
    () => (entry ? entry.trim().split(/\s+/).filter(Boolean).length : 0),
    [entry],
  );

  const handleBiasToggle = (key: BiasKeys) =>
    setSelectedBiases((prev) => ({ ...prev, [key]: !prev[key] }));

  // Here is where we handle the form submission and connect to the backend API
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = entry.trim();

    if (!trimmed) {
      setError("Please add text to analyze before submitting.");
      return;
    }

    setError(null);

    // Prepare payload for backend, might not need sensitivity depending.
    const payload = {
      entry: trimmed,
      sensitivity,
      selected: selectedBiases,
    };

    try {
      // Send POST request to backend API
      const response = await fetch("http://localhost:8000/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Server Error");

      const results = await response.json();

      navigate("/main", { state: { results, entry: trimmed } });
    } catch (error) {
      setError(
        "An error occurred while processing your request. Please try again.",
      );
      console.error("Error during analysis:", error);
    }
    // What was before we connected to the backend.
    // navigate(`/main?${params.toString()}`);
  };

  return (
    <AppLayout
      variant="full"
      backgroundClassName="bg-gradient-to-br from-stone-100 via-amber-50 to-stone-200"
      contentClassName="w-full"
    >
      <form
        onSubmit={handleSubmit}
        className="w-full space-y-6 rounded-3xl border border-emerald-200 bg-white/90 p-8 shadow-lg backdrop-blur"
      >
        {/* Header */}
        <div className="space-y-1 mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-stone-900">
            Analyze Your Content
          </h1>
          <p className="text-stone-600">
            Enter text and choose what to check for.
          </p>
        </div>

        {/* TWO-COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-6">
            {/* TOP ROW OF TWO BOXES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bias Types */}
              <div className="rounded-2xl border-2 border-stone-200 p-5 min-h-[360px]">
                <div className="flex items-center gap-3 mb-3">
                  <Settings className="w-5 h-5 text-stone-700" />
                  <h3 className="text-lg font-semibold text-stone-800">
                    Select Bias Types
                  </h3>
                </div>

                <div className="space-y-2">
                  {(
                    [
                      [
                        "sentiment",
                        "Sentiment Bias",
                        "Detect emotional tone and language",
                      ],
                      [
                        "political",
                        "Political Bias",
                        "Identify political leanings",
                      ],
                      [
                        "racial",
                        "Racial/Cultural Bias",
                        "Check for cultural sensitivity",
                      ],
                      [
                        "gender",
                        "Gender/Inclusivity Bias",
                        "Analyze inclusive language",
                      ],
                    ] as const
                  ).map(([key, label, desc]) => (
                    <label
                      key={key}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50 cursor-pointer transition"
                    >
                      <input
                        type="checkbox"
                        checked={selectedBiases[key]}
                        onChange={() => handleBiasToggle(key)}
                        className="w-5 h-5 accent-green-600"
                      />
                      <div>
                        <p className="font-medium text-stone-800">{label}</p>
                        <p className="text-xs text-stone-600">{desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sensitivity */}
              <div className="rounded-2xl border-2 border-stone-200 p-5 min-h-[360px]">
                <h3 className="text-lg font-semibold text-stone-800 mb-3">
                  Sensitivity Level
                </h3>

                {(["low", "medium", "high"] as const).map((level) => (
                  <label
                    key={level}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50 cursor-pointer transition"
                  >
                    <input
                      type="radio"
                      name="sensitivity"
                      checked={sensitivity === level}
                      onChange={() => setSensitivity(level)}
                      className="w-4 h-4 accent-green-600"
                    />
                    <div>
                      <p className="font-medium text-stone-800">
                        {level[0].toUpperCase() + level.slice(1)}
                      </p>
                      <p className="text-xs text-stone-600">
                        {level === "low" && "Flag only strong bias"}
                        {level === "medium" &&
                          "Balanced detection (recommended)"}
                        {level === "high" && "Flag all potential bias"}
                      </p>
                    </div>
                  </label>
                ))}

                <div className="mt-4 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <p className="text-sm text-amber-900">
                      Higher sensitivity may produce more false positives but
                      ensures comprehensive analysis.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* DISCLAIMER — moved here */}
            <div className="flex items-start gap-3 rounded-xl bg-emerald-800 p-4 text-emerald-100">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">
                Analysis is based on NLP models trained on neutral datasets to
                encourage objective evaluation.
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN — Input Text */}
          <div className="self-start rounded-2xl border-2 border-stone-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <FileText className="w-5 h-5 text-stone-700" />
              <h2 className="text-lg font-semibold text-stone-800">
                Input Text
              </h2>
            </div>

            <textarea
              id="entry"
              name="entry"
              rows={12}
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              placeholder="Paste content here… (articles, posts, essays, etc.)"
              className="w-full resize-none rounded-xl border-2 border-stone-300 bg-emerald-50/50 px-5 py-4 text-base text-stone-900 shadow-inner focus:border-stone-500 focus:outline-none"
            />

            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-stone-500">
                {entry.length} characters • {wordCount}{" "}
                {wordCount === 1 ? "word" : "words"}
              </p>

              <button
                type="button"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-stone-600 hover:bg-stone-100 transition"
                onClick={() => alert("File upload coming soon")}
              >
                <Upload className="w-4 h-4" />
                <span className="text-sm font-medium">Upload File</span>
              </button>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={!entry.trim()}
              className="mt-6 w-full rounded-xl bg-emerald-500 py-3 text-base font-semibold text-white shadow-md hover:bg-emerald-600 transition disabled:opacity-50"
            >
              Analyze Content
            </button>
          </div>
        </div>
      </form>
    </AppLayout>
  );
}
