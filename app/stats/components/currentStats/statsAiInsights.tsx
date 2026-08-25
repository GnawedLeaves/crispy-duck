"use client";

import { token } from "@/app/theme";
import { useAiInsight } from "@/app/utils/hooks/useAiInsight";
import { BodyScanDataPoint } from "@/app/utils/supabase/getBodyScanDataAction";
import { RotateCcw, Sparkles, X } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface StatsAiInsightsProps {
  trendData: BodyScanDataPoint[];
}

const SYSTEM_INSTRUCTION = `You are an expert fitness, nutrition, and body composition analyst for Crispy Duck. 
The user's primary goal is body recomposition (building muscle while losing fat).
Analyze the provided Body Scan data history.
1. Identify key trends across weight, body fat %, muscle mass, and visceral fat.
2. Provide short, punchy, actionable insights based strictly on the trajectory.
3. Focus recommendations on progressive overload, protein target, calories, and recovery.
Keep responses formatted entirely in clear bullet points with a motivating, coaching tone.
Keep responses short and add an extra spacings in between each paragraph
Return 2 sections, bolded: KEY TRENDS and PERFORMANCE INSIGHTS & ACTION PLAN`;

const StatsAiInsights = ({ trendData }: StatsAiInsightsProps) => {
  const { insight, isLoading = true, error, generate, clear: clearInsight } = useAiInsight();


  const handleGenerateInsights = () => {
    if (!trendData || trendData.length === 0) return;
    generate({
      prompt:
        "Analyze my recent body composition scans and provide performance insights.",
      systemInstruction: SYSTEM_INSTRUCTION,
      tone: "motivating, athletic, and direct",
      context: trendData,
    });
  }

  const handleClearInsight = () => {
    clearInsight()
  }

  const handleRegenerateInsight = () => {
    handleClearInsight()
    handleGenerateInsights()
  }


  if (error) return <div>Failed to load insights.{error}</div>;

  return (
    <div className="py-8 rounded-lg bg-card text-card-foreground flexCenter">
      {trendData && trendData.length > 0 && !isLoading && !insight &&
        <button className="standardButton flex gap-2" style={{ background: token.light.primaryColor }} onClick={() => { handleGenerateInsights() }}>  <Sparkles />AI Analysis</button>
      }
      {isLoading && <div className="flexCenter gap-2"><span className="loading loading-spinner loading-md"></span>Analysing, do not leave this page.</div>}

      {insight && <div>
        <div className="flex justify-between py-4 ">
          <h2 className="font-bold text-lg mb-2">Crispy Duck AI Analysis</h2>
          <div className="flex gap-2">
            <button className="standardButton flexCenter" style={{
              width: "2.5rem",
              height: "2.5rem",
            }} onClick={() => { handleRegenerateInsight() }}><RotateCcw /></button>
            <button className="standardButton flexCenter" style={{
              width: "2.5rem",
              height: "2.5rem",
            }} onClick={() => { handleClearInsight() }}><X /></button>
          </div>

        </div>
        <div className="cardWithShadow">
          <div className="prose prose-sm dark:prose-invert [&_p]:mb-6 [&_ul]:mb-6 [&_li]:mb-3">
            <ReactMarkdown>{insight}</ReactMarkdown>
          </div>
        </div>
      </div>
      }

    </div>
  );
};

export default StatsAiInsights;
