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
  const { results, entry } = location.state || {};

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

  // This is a more dynamic way to generate the sentiment data for the chart.
  // It will loop through the sentiment scores and create an array of objects with the name, value, and color for each emotion.
  const sentimentData = sentimentScores.map((item: any) => ({
    name: item.label.charAt(0).toUpperCase() + item.label.slice(1), // Capitalize first letter
    value: Number((item.score * 100).toFixed(2)),
    color: emotionColors[item.label] || "#6b7280", // Default to gray if no color defined
  }));

  const sortedSentimentData = [...sentimentData].sort((a, b) => b.value - a.value);

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
  const politicalBiasData = politicalBiasScores.length
  ? politicalBiasScores.map((item: any) => ({
      name: item.label.charAt(0).toUpperCase() + item.label.slice(1),
      value: Number((item.score * 100).toFixed(2)),
      color: politicalColors[item.label] || "#6b7280",
    }))
  : [];

  // This is for the stats poriton, just testing out a different way to generate the data for the stats section.
  // Specifically, this is so that we can keep unique messages for each bias category.
  const politicalData = [
  {
    label: "Left-Leaning",
    value: results?.results?.political?.[0]?.score || 0,
    highMessage: "Progressive language and framing detected.",
    lowMessage: "Low presence of progressive framing detected.",
    colors: { bgFrom: "from-blue-50", bgTo: "to-blue-100", border: "border-blue-200", title: "text-blue-900", value: "text-blue-700", para: "text-blue-800" }
  },
  {
    label: "Center",
    value: results?.results?.political?.[1]?.score || 0,
    highMessage: "Balanced political perspective maintained.",
    lowMessage: "Low presence of centrist framing detected.",
    colors: { bgFrom: "from-purple-50", bgTo: "to-purple-100", border: "border-purple-200", title: "text-purple-900", value: "text-purple-700", para: "text-purple-800" }
  },
  {
    label: "Right-Leaning",
    value: results?.results?.political?.[2]?.score || 0,
    highMessage: "Conservative language and framing detected.",
    lowMessage: "Low presence of conservative framing detected.",
    colors: { bgFrom: "from-pink-50", bgTo: "to-pink-100", border: "border-pink-200", title: "text-pink-900", value: "text-pink-700", para: "text-pink-800" }
  }
  ];

  const sortedPoliticalData = [...politicalData].sort((a, b) => b.value - a.value);

  // For the political bias stats, we can use the same threshold as the sentiment analysis for consistency.
  const threshold = 30; // 30% threshold for high/low occurrence


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

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: FileText
    },
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
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === tab.id
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

          {/* Original Text Display */}
          {entry && (
            <div className="flex justify-center mb-8">
              <div className="bg-white border-2 border-stone-200 shadow-xl rounded-2xl p-6 max-w-3xl w-full text-center">
                <h3 className="text-xl font-semibold text-stone-800 mb-3">Analyzed Text</h3>
                <p className="text-stone-700 whitespace-pre-wrap">{entry}</p>
              </div>
            </div>
          )}


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


                {/* Leaving this for now since it does work, but if we want to group up the emotions, then
                we will have to make some changes later to showcase that. */}
                <div className="space-y-4">
                  {sortedSentimentData.map((item, idx) => (
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
                        {/* Will probably change this value to something greater for sentiment analysis, 
                        but for now it just checks if the value is greater than 0.3 (30%) to determine if it's a high or low occurrence. */}
                        {item.value > 0.3
                          ? "High likelihood of this sentiment present in the content."
                          : "Low occurrence detected for this sentiment category."}
                      </p>
                    </div>
                  ))}
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

                <div className="space-y-4">
                  {sortedPoliticalData.map((item, idx) => {
                    const isHigh = item.value * 100 >= threshold;

                    return (
                      <div
                        key={idx}
                        className={`bg-gradient-to-br ${item.colors.bgFrom} ${item.colors.bgTo} 
                                    rounded-2xl shadow-xl p-6 border-2 ${item.colors.border}`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className={`text-lg font-semibold ${item.colors.title}`}>
                            {item.label}
                          </h4>
                          <span className={`text-3xl font-bold ${item.colors.value}`}>
                            {(item.value * 100).toFixed(2)}%
                          </span>
                        </div>

                        <p className={`${item.colors.para} text-sm`}>
                          {isHigh ? item.highMessage : item.lowMessage}
                        </p>
                      </div>
                    );
                  })}
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
                      <YAxis tick={{ fill: "#444", fontSize: 12 }}
                        domain={[0, 1]} />
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
                {results?.results?.sentiment && (
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
                )}

                {results?.results?.political && (
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
                )}
              </div>


              {/* Toxicity Chart */}
              {results?.results?.toxicity && (
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
                      <YAxis tick={{ fill: "#444", fontSize: 12 }}
                        domain={[0, 1]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value">
                        {toxicityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

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
