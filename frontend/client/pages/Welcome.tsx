// src/pages/Welcome.tsx
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import {
  FileText,
  TrendingUp,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

export default function WelcomePage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: TrendingUp,
      title: "Sentiment Analysis",
      description:
        "Detect emotional tone and language patterns in your content",
    },
    {
      icon: Shield,
      title: "Political Bias Detection",
      description: "Identify political leanings and partisan language",
    },
    {
      icon: FileText,
      title: "Multiple Bias Types",
      description: "Check for racial, cultural, gender, and inclusivity bias",
    },
    {
      icon: Zap,
      title: "Adjustable Sensitivity",
      description: "Control detection levels from subtle to comprehensive",
    },
  ];

  const benefits = [
    "Transparent NLP models trained on neutral datasets",
    "Visual representations with charts and highlights",
    "Citations and references for flagged content",
    "Perfect for academic, professional, and personal use",
  ];

  return (
    <AppLayout
      variant="full"
      backgroundClassName="bg-gradient-to-br from-stone-100 via-amber-50 to-stone-200"
      contentClassName="!px-0 max-w-full"
    >
      {/* HERO SECTION */}
      <div className="w-full px-8 py-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* LEFT HERO */}
          <div className="flex flex-col gap-6">
            {/* Icon */}
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: "#9caf88" }}
            >
              <FileText className="w-10 h-10 text-stone-800" />
            </div>

            {/* Title */}
            <h1 className="text-5xl font-bold text-stone-800">Bias Analyzer</h1>

            {/* Subtitle */}
            <p className="text-xl text-stone-600">
              Detect and understand bias in your content
            </p>

            {/* Description */}
            <p className="text-lg text-stone-600 max-w-md leading-relaxed">
              Our NLP-powered tool helps you identify sentiment, political
              leanings, and various forms of bias in your text with clarity and
              transparency.
            </p>

            {/* Button */}
            <button
              onClick={() => navigate("/analyze")}
              className="mt-4 inline-flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-lg shadow-lg transition-all hover:scale-105"
              style={{ backgroundColor: "#9caf88", color: "#1c1917" }}
            >
              Get Started
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>

          {/* RIGHT FEATURES GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl shadow-xl p-6 border border-stone-200 hover:border-stone-300 transition-all"
              >
                <div className="flex items-start gap-4 mb-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: "#b8c9a8" }}
                  >
                    <feature.icon className="w-6 h-6 text-stone-800" />
                  </div>
                  <h3 className="text-lg font-semibold text-stone-800">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-stone-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BENEFITS SECTION */}
      <div className="w-full px-8 py-10">
        <div className="max-w-7xl mx-auto">
          {/* Benefits Card */}
          <div className="bg-white rounded-2xl shadow-xl p-10 border border-stone-200 mb-20">
            <h2 className="text-3xl font-bold text-stone-800 mb-8 text-center">
              Why Use Bias Analyzer?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <p className="text-stone-700 leading-relaxed">{benefit}</p>
                </div>
              ))}
            </div>
          </div>

          {/* USE CASES */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Academic",
                text: "Check essays, research, and educational content.",
                bg: "bg-blue-50",
                border: "border-blue-200",
                textColor: "text-blue-900",
              },
              {
                title: "Professional",
                text: "Ensure neutral workplace communication.",
                bg: "bg-purple-50",
                border: "border-purple-200",
                textColor: "text-purple-900",
              },
              {
                title: "Personal",
                text: "Evaluate news, social media, and online content.",
                bg: "bg-amber-50",
                border: "border-amber-200",
                textColor: "text-amber-900",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className={`${item.bg} ${item.border} rounded-2xl p-6 border shadow-md transition-all`}
              >
                <h3 className={`text-xl font-semibold mb-3 ${item.textColor}`}>
                  {item.title}
                </h3>
                <p className={`${item.textColor.replace("900", "800")}`}>
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
