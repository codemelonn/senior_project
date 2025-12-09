/*
Index ("/") — Landing & Input
*/

import { FormEvent, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import {
  FileText,
  Upload,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";

type BiasKeys = "sentiment" | "political" | "toxicity";
type Sensitivity = "low" | "medium" | "high";

export default function Index() {
  const [entry, setEntry] = useState("");
  const [fileUploaded, setFileUploaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileUploading, setFileUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedBiases, setSelectedBiases] = useState<
    Record<BiasKeys, boolean>
  >({
    sentiment: true,
    political: true,
    toxicity: false,
  });

  const [sensitivity, setSensitivity] = useState<Sensitivity>("medium");

  const navigate = useNavigate();

  const wordCount = useMemo(
    () => (entry ? entry.trim().split(/\s+/).filter(Boolean).length : 0),
    [entry]
  );

  const handleBiasToggle = (key: BiasKeys) =>
    setSelectedBiases((prev) => ({ ...prev, [key]: !prev[key] }));

  // -------------------------------
  //   Upload File → Extract Text
  // -------------------------------
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setFileUploading(true);
    setUploadedFileName(file.name);

    const validTypes = ["text/plain", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      setError("Please upload only .txt or .pdf files.");
      setFileUploading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://localhost:8000/api/analyze-file", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error(`Upload failed: ${response.status}`);

      const data = await response.json();

      if (!data.extracted_text) {
        throw new Error("Server returned no text");
      }

      setEntry(data.extracted_text);
      setFileUploaded(true);
    } catch (err) {
      setError("Error processing file. Try a different file.");
      console.error(err);
    } finally {
      setFileUploading(false);
    }
  };

  // -------------------------------
  //   CANCEL UPLOAD → Reset UI & File Input
  // -------------------------------
  const handleCancelUpload = () => {
    setEntry("");
    setFileUploaded(false);
    setUploadedFileName(null);
    setError(null);

    // **Reset the actual file input** so reupload works
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // -------------------------------
  //   Submit when Analyze is clicked
  // -------------------------------
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = entry.trim();

    if (!trimmed) {
      setError("Please add text to analyze before submitting.");
      return;
    }

    setError(null);

    const payload = {
      entry: trimmed,
      sensitivity,
      selected: selectedBiases,
    };

    try {
      const response = await fetch("http://localhost:8000/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Server Error");

      const results = await response.json();

      navigate("/main", { state: { results, entry: trimmed } });
    } catch (error) {
      setError("Error analyzing content. Please try again.");
      console.error("Analysis error:", error);
    }
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
          <p className="text-stone-600">Enter text or upload a file.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-6">
            {/* Bias Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bias Types */}
              <div className="rounded-2xl border-2 border-stone-200 p-5 min-h-[360px]">
                <h3 className="text-lg font-semibold text-stone-800 mb-3">
                  Select Bias Types
                </h3>

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
                        "toxicity",
                        "Toxicity",
                        "Flag harmful or offensive content",
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
                    </div>
                  </label>
                ))}

                <div className="mt-4 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <p className="text-sm text-amber-900">
                      Higher sensitivity may catch subtle bias but may increase
                      false positives.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="flex items-start gap-3 rounded-xl bg-emerald-800 p-4 text-emerald-100">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">
                Analysis is based on NLP models trained on neutral datasets.
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

            {/* ❗ Hide textarea when file uploaded */}
            {!fileUploaded && (
              <textarea
                id="entry"
                name="entry"
                rows={12}
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
                placeholder="Paste content here… or upload a .txt/.pdf file."
                className="w-full resize-none rounded-xl border-2 border-stone-300 bg-emerald-50/50 px-5 py-4 text-base text-stone-900 shadow-inner focus:border-stone-500 focus:outline-none"
              />
            )}

            {/* FILE UPLOADED STATE */}
            {fileUploaded && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-stone-700 flex justify-between items-center">
                <span>
                  <strong>{uploadedFileName}</strong> uploaded and processed.
                </span>

                <button
                  type="button"
                  onClick={handleCancelUpload}
                  className="flex items-center gap-1 text-red-600 hover:text-red-700 font-medium"
                >
                  <XCircle className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            )}

            {/* Word + Character Count */}
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-stone-500">
                {entry.length} characters • {wordCount}{" "}
                {wordCount === 1 ? "word" : "words"}
              </p>

              {/* File Upload */}
              <label className="flex items-center gap-2 rounded-lg px-3 py-2 text-stone-600 hover:bg-stone-100 cursor-pointer transition">
                <Upload className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {fileUploading ? "Processing..." : "Upload File"}
                </span>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt, .pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={fileUploading}
                />
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!entry.trim() || fileUploading}
              className="mt-6 w-full rounded-xl bg-emerald-500 py-3 text-base font-semibold text-white shadow-md hover:bg-emerald-600 transition disabled:opacity-50"
            >
              Analyze Content
            </button>

            {error && (
              <p className="text-sm text-red-600 mt-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </p>
            )}
          </div>
        </div>
      </form>
    </AppLayout>
  );
}
