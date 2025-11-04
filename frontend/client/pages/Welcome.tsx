// src/pages/Welcome.tsx
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { FileText, TrendingUp, Shield, Zap, ArrowRight, CheckCircle } from "lucide-react";

export default function WelcomePage() {
  const navigate = useNavigate();

  const features = [
    { icon: TrendingUp, title: "Sentiment Analysis", description: "Detect emotional tone and language patterns in your content" },
    { icon: Shield, title: "Political Bias Detection", description: "Identify political leanings and partisan language" },
    { icon: FileText, title: "Multiple Bias Types", description: "Check for racial, cultural, gender, and inclusivity bias" },
    { icon: Zap, title: "Adjustable Sensitivity", description: "Control detection levels from subtle to comprehensive" },
  ];

  const benefits = [
    "Transparent NLP models trained on neutral datasets",
    "Visual representations with charts and highlights",
    "Citations and references for flagged content",
    "Perfect for academic, professional, and personal use",
  ];

  return (
    <AppLayout
      variant="minimal"
      backgroundClassName="bg-gradient-to-br from-stone-100 via-amber-50 to-stone-200"
      contentClassName="w-full"
    >
      <div className="max-w-6xl mx-auto px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block p-4 rounded-2xl mb-6" style={{ backgroundColor: "#9caf88" }}>
            <FileText className="w-12 h-12 text-stone-800" />
          </div>
          <h1 className="text-6xl font-bold text-stone-800 mb-4">Bias Analyzer</h1>
          <p className="text-2xl text-stone-600 mb-8">Detect and understand bias in your content</p>
          <p className="text-lg text-stone-500 max-w-2xl mx-auto">
            Our NLP-powered tool helps you identify sentiment, political leanings, and various forms of bias in text.
            Built with transparency and neutrality at its core.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl shadow-xl p-8 border-2 border-stone-200 hover:border-stone-300 transition-all hover:scale-105 duration-200"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl" style={{ backgroundColor: "#b8c9a8" }}>
                  <feature.icon className="w-6 h-6 text-stone-800" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-stone-800 mb-2">{feature.title}</h3>
                  <p className="text-stone-600">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Benefits */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-stone-200 mb-12">
          <h2 className="text-3xl font-bold text-stone-800 mb-6 text-center">Why Use Bias Analyzer?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 rounded-xl hover:bg-stone-50 transition-all">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-stone-700">{benefit}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Use Cases */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border-2 border-blue-200">
            <h3 className="text-xl font-semibold text-blue-900 mb-3">Academic</h3>
            <p className="text-blue-800">Check research papers, essays, and articles for bias and inclusivity</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border-2 border-purple-200">
            <h3 className="text-xl font-semibold text-purple-900 mb-3">Professional</h3>
            <p className="text-purple-800">Ensure neutral communications in workplace documents and emails</p>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 border-2 border-amber-200">
            <h3 className="text-xl font-semibold text-amber-900 mb-3">Personal</h3>
            <p className="text-amber-800">Evaluate news articles, social media posts, and online content</p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={() => navigate("/analyze")}
            className="inline-flex items-center gap-3 px-12 py-5 rounded-2xl font-semibold text-xl shadow-2xl transition-all duration-200 hover:scale-105"
            style={{ backgroundColor: "#9caf88", color: "#1c1917" }}
          >
            Get Started
            <ArrowRight className="w-6 h-6" />
          </button>
          <p className="text-stone-500 mt-4">No sign-up required • Free to use • Privacy-focused</p>
        </div>

        {/* Trust Banner */}
        <div className="mt-16 p-8 rounded-2xl" style={{ backgroundColor: "#8a9d7a" }}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Shield className="w-8 h-8 text-stone-100" />
              <div>
                <h3 className="text-xl font-semibold text-stone-100 mb-1">Transparent & Neutral</h3>
                <p className="text-stone-200">Built on NLP models trained with neutral, diverse datasets</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-2xl font-bold text-stone-100">100% Privacy</p>
              <p className="text-stone-200">Your text is never stored or shared</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
