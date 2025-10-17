import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";

export default function Index() {
  const [entry, setEntry] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = entry.trim();

    if (!trimmed) {
      setError("Please add text to analyze before submitting.");
      return;
    }

    setError(null);
    const encoded = encodeURIComponent(trimmed);
    navigate(`/main?entry=${encoded}`);
  };

  return (
    <AppLayout
      variant="minimal"
      backgroundClassName="bg-[#dcefdc]"
      contentClassName="w-full"
    >
      <form
        onSubmit={handleSubmit}
        className="w-full space-y-4 rounded-3xl border border-emerald-200 bg-white/90 p-8 shadow-lg backdrop-blur"
      >
        <label htmlFor="entry" className="block text-sm font-medium text-emerald-900">
          Insert text to check for bias
        </label>
        <textarea
          id="entry"
          name="entry"
          rows={6}
          value={entry}
          onChange={(event) => setEntry(event.target.value)}
          placeholder="Type or paste content here..."
          className="w-full resize-none rounded-2xl border border-emerald-100 bg-emerald-50/50 px-5 py-4 text-base text-emerald-950 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300"
        />
        {error ? (
          <p className="text-sm font-medium text-rose-600">{error}</p>
        ) : null}
        <button
          type="submit"
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3 text-base font-semibold text-white shadow-md transition-transform duration-200 hover:-translate-y-0.5 hover:bg-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
        >
          Submit
        </button>
      </form>
    </AppLayout>
  );
}
