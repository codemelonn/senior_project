/*
Main ("/main") — Results Dashboard

This page displays the interactive bias analysis dashboard with 
tabs for Sentiment, Political, and Overview data visualizations.
*/

import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Bar, CartesianGrid, XAxis, YAxis, BarChart } from "recharts";
import { BarChart3, TrendingUp, AlertCircle, FileText } from "lucide-react";

export default function Main() {
  // const [activeTab, setActiveTab] = useState("sentiment");
  

  const location = useLocation();
  const {results, entry} = location.state || {};

  // console.log("Sadness score:", results?.results?.sentiment?.all_scores[0]);

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <p className="text-stone-800">No analysis results available.</p>
      </div>
    );
  }

  // Define colors for each emotion
  const emotionColors: Record<string, string> = {
    sadness: "#3b82f6",
    joy: "#fbbf24",
    love: "#ec4899",
    anger: "#ef4444",
    fear: "#8b5cf6",
    surprise: "#14b8a6",
  };

  // This sames a safe way to access the sentiment scores without worrying about undefined values.
  const sentimentScores = results?.results?.sentiment?.all_scores || [];

  // Commenting this out since it's not optimal and safe, but will keep it for reference.
  // const sentimentData = [
  //   // { name: "Positive", value: 45, color: "#10b981" },
  //   // { name: "Neutral", value: 30, color: "#f59e0b" },
  //   // { name: "Negative", value: 25, color: "#ef4444" },

  //   // Not the most optimal way to do this but works for now.
  //   // One problems is that if some of the values are too small, then the chart won't show them and you're stuck with only one emotion showing.
  //   // Good news, it does work dynamically based on the results from the backend.
  //   // TODO: Change the chart section so the side results aren't hardcoded but generated based on the results from the backend.

  //   { name: "Sadness", value: Number((results.results.sentiment.all_scores[0].score * 100).toFixed(2)), color: "#3b82f6" },
  //   { name: "Joy", value: Number((results.results.sentiment.all_scores[1].score * 100).toFixed(2)), color: "#fbbf24" },
  //   { name: "Love", value: Number((results.results.sentiment.all_scores[2].score * 100).toFixed(2)), color: "#ec4899" },
  //   { name: "Anger", value: Number((results.results.sentiment.all_scores[3].score * 100).toFixed(2)), color: "#ef4444" },
  //   { name: "Fear", value: Number((results.results.sentiment.all_scores[4].score * 100).toFixed(2)), color: "#8b5cf6" },
  //   { name: "Surprise", value: Number((results.results.sentiment.all_scores[5].score * 100).toFixed(2)), color: "#14b8a6" }

  // ];

  // This is a more dynamic way to generate the sentiment data for the chart.
  // It will loop through the sentiment scores and create an array of objects with the name, value, and color for each emotion.
  const sentimentData = sentimentScores.map((item: any) => ({
    name: item.label.charAt(0).toUpperCase() + item.label.slice(1), // Capitalize first letter
    value: Number((item.score * 100).toFixed(2)),
    color: emotionColors[item.label] || "#6b7280", // Default to gray if no color defined
  }));

  // Store the political bias scores in a variable for easier access.
  const politicalBiasScores = results?.results?.political || [];

  // Define colors for each political bias
  const politicalColors: Record<string, string> = {
    Left: "#3b82f6",
    Center: "#35bb47ff",
    Right: "#d52629ff",
  };

  // Generate the political bias data for the chart.
  // Similar to the sentiment data, it will loop through the political bias scores and create an array of objects with the name, value, and color for each bias.
  const politicalBiasData = politicalBiasScores.map((item: any) => ({
    name: item.label.charAt(0).toUpperCase() + item.label.slice(1),
    value: Number((item.score * 100).toFixed(2)),
    color: politicalColors[item.label] || "#6b7280",
  }));

  // Store toxicity scores in a variable for easier access.
  const toxicityScores = results?.results?.toxicity || {};

  const toxicityColors: Record<string, string> = {
    "Toxicity": "#ef4444",
    "Severe Toxicity": "#b91c1c",
    "Obscene": "#f97316",
    "Identity Attack": "#a855f7",
    "Insult": "#eab308",
    "Threat": "#000000",
    "Sexual Explicit": "#ec4899",
  };

  // Convert toxicity object -> chart array
  const toxicityData = Object.entries(toxicityScores).map(([label, value]) => ({
    name: label,                                            // Already properly formatted
    value: Number(((value as number) * 100).toFixed(4)),               // Convert to percentage
    color: toxicityColors[label] || "#6b7280",             // Default = gray
  }));

  // const tabs = [
  //   { id: "sentiment", label: "Sentiment Bias", icon: TrendingUp },
  //   { id: "political", label: "Political Bias", icon: BarChart3 },
  //   { id: "toxicity", label: "Toxicity", icon: AlertCircle },
  //   { id: "overview", label: "Overview", icon: FileText },
  // ];

  const tabs = [
    results?.results?.sentiment && {
      id: "sentiment",
      label: "Sentiment Bias",
      icon: TrendingUp
    },
    results?.results?.political && {
      id: "political",
      label: "Political Bias",
      icon: BarChart3
    },
    results?.results?.toxicity && {
      id: "toxicity",
      label: "Toxicity",
      icon: AlertCircle
    },
    {
      id: "overview",
      label: "Overview",
      icon: FileText
    },
  ].filter(Boolean); // <-- removes null entries

  const availableTabs = tabs.map(t => t.id);
  const [activeTab, setActiveTab] = useState(availableTabs[0]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-stone-800 px-4 py-2 rounded-lg border border-stone-600">
          <p className="text-stone-100 font-semibold">{payload[0].name}</p>
          <p className="text-stone-300">{payload[0].value}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-amber-50 to-stone-200 flex">
      {/* Sidebar */}
      <div className="w-64 shadow-2xl p-6" style={{ backgroundColor: "#9caf88" }}>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-stone-800 mb-2">Bias Analyzer</h1>
          <p className="text-stone-700 text-sm">Content Analysis Tool</p>
        </div>

        <nav className="space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === tab.id
                  ? "text-stone-800 shadow-lg"
                  : "text-stone-700 hover:bg-stone-700/20"
              }`}
              style={activeTab === tab.id ? { backgroundColor: "#b8c9a8" } : {}}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-12 p-4 rounded-xl" style={{ backgroundColor: "#8a9d7a" }}>
          <AlertCircle className="w-6 h-6 text-stone-100 mb-2" />
          <p className="text-stone-100 text-sm">
            Analysis based on NLP models trained on neutral datasets
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-stone-800 mb-2">
              {tabs.find((t) => t.id === activeTab)?.label}
            </h2>
            <p className="text-stone-600">Real-time bias detection and analysis</p>
          </div>

          {/* Sentiment Bias View */}
          {activeTab === "sentiment" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-stone-200">
                  <h3 className="text-xl font-semibold text-stone-800 mb-6">Sentiment Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={sentimentData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {sentimentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-3 gap-3 mt-6">
                    {sentimentData.map((item, idx) => (
                      <div key={idx} className="text-center">
                        <div
                          className="w-4 h-4 rounded-full mx-auto mb-2"
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <p className="text-stone-700 font-medium text-sm">{item.name}</p>
                        <p className="text-stone-500 text-xs">{item.value}%</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-xl p-6 border-2 border-green-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-semibold text-green-900">Positive Tone</h4>
                      <span className="text-3xl font-bold text-green-700">45%</span>
                    </div>
                    <p className="text-green-800 text-sm">
                      Content shows optimistic and constructive language
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl shadow-xl p-6 border-2 border-amber-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-semibold text-amber-900">Neutral Tone</h4>
                      <span className="text-3xl font-bold text-amber-700">30%</span>
                    </div>
                    <p className="text-amber-800 text-sm">
                      Balanced and objective presentation of information
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl shadow-xl p-6 border-2 border-red-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-semibold text-red-900">Negative Tone</h4>
                      <span className="text-3xl font-bold text-red-700">25%</span>
                    </div>
                    <p className="text-red-800 text-sm">Critical or pessimistic language detected</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Political Bias View */}
          {activeTab === "political" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-stone-200">
                  <h3 className="text-xl font-semibold text-stone-800 mb-6">
                    Political Bias Distribution
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={politicalBiasData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {politicalBiasData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-3 gap-3 mt-6">
                    {politicalBiasData.map((item, idx) => (
                      <div key={idx} className="text-center">
                        <div
                          className="w-4 h-4 rounded-full mx-auto mb-2"
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <p className="text-stone-700 font-medium text-sm">{item.name}</p>
                        <p className="text-stone-500 text-xs">{item.value}%</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-xl p-6 border-2 border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-semibold text-blue-900">Left-Leaning</h4>
                      <span className="text-3xl font-bold text-blue-700">28%</span>
                    </div>
                    <p className="text-blue-800 text-sm">
                      Progressive language and framing detected
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl shadow-xl p-6 border-2 border-purple-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-semibold text-purple-900">Center</h4>
                      <span className="text-3xl font-bold text-purple-700">44%</span>
                    </div>
                    <p className="text-purple-800 text-sm">
                      Balanced political perspective maintained
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl shadow-xl p-6 border-2 border-pink-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-semibold text-pink-900">Right-Leaning</h4>
                      <span className="text-3xl font-bold text-pink-700">28%</span>
                    </div>
                    <p className="text-pink-800 text-sm">
                      Conservative language and framing detected
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Toxicity View */}
          {activeTab === "toxicity" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-stone-200">
                  <h3 className="text-xl font-semibold text-stone-800 mb-6">
                    Toxicity Distribution
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart 
                      data={toxicityData}
                      margin={{ top: 20, right: 20, left: 20, bottom: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: "#444", fontSize: 12 }}
                        interval={0}
                        angle={-20}
                        textAnchor="end"
                      />
                      <YAxis tick={{ fill: "#444", fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value">
                        {toxicityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>

                  {/* Legend */}
                  <div className="grid grid-cols-3 gap-3 mt-6">
                    {toxicityData.map((item, idx) => (
                      <div key={idx} className="text-center">
                        <div
                          className="w-4 h-4 rounded-full mx-auto mb-2"
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <p className="text-stone-700 font-medium text-sm">
                          {item.name}
                        </p>
                        <p className="text-stone-500 text-xs">
                          {item.value}%
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-4">
                  {toxicityData.map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl shadow-xl p-6 border-2"
                      style={{
                        backgroundColor: item.color + "20",
                        borderColor: item.color,
                      }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-lg font-semibold" style={{ color: item.color }}>
                          {item.name}
                        </h4>
                        <span className="text-3xl font-bold" style={{ color: item.color }}>
                          {item.value}%
                        </span>
                      </div>
                      <p className="text-stone-700 text-sm">
                        {item.value > 0.3
                          ? "High likelihood of this toxic indicator present in the content."
                          : "Low occurrence detected for this toxicity category."}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}


          {/* Overview View */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Both Charts */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-stone-200">
                  <h3 className="text-xl font-semibold text-stone-800 mb-6">Sentiment Analysis</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={sentimentData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {sentimentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-stone-200">
                  <h3 className="text-xl font-semibold text-stone-800 mb-6">Political Bias</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={politicalBiasData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {politicalBiasData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-stone-200">
                <h3 className="text-xl font-semibold text-stone-800 mb-4">Analysis Summary</h3>
                <p className="text-stone-600 leading-relaxed">
                  This content demonstrates a balanced approach with a slight positive sentiment (45%) and
                  maintains political neutrality with the majority of content (44%) classified as center-positioned.
                  The analysis is based on NLP models trained on neutral datasets to ensure objective evaluation.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
