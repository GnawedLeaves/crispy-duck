"use client";

import { useAiInsight } from "@/app/utils/hooks/useAiInsight";
import { BodyScanDataPoint } from "@/app/utils/supabase/getBodyScanDataAction";
import React, { useEffect } from "react";

interface StatsAiInsightsProps {
  trendData: BodyScanDataPoint[];
}

const SYSTEM_INSTRUCTION = `You are an expert fitness, nutrition, and body composition analyst for Crispy Duck. 
The user's primary goal is body recomposition (building muscle while losing fat).
Analyze the provided Body Scan data history.
1. Identify key trends across weight, body fat %, muscle mass, and visceral fat.
2. Provide short, punchy, actionable insights based strictly on the trajectory.
3. Focus recommendations on progressive overload, protein target, calories, and recovery.
Keep responses formatted entirely in clear bullet points with a motivating, coaching tone.`;

const StatsAiInsights = ({ trendData }: StatsAiInsightsProps) => {
  const { insight, isLoading, error, generate, clear } = useAiInsight();

  useEffect(() => {
    if (!trendData || trendData.length === 0) return;

    // Trigger AI generation safely within useEffect
    generate({
      prompt:
        "Analyze my recent body composition scans and provide performance insights.",
      systemInstruction: SYSTEM_INSTRUCTION,
      tone: "motivating, athletic, and direct",
      context: trendData,
    });
  }, [trendData]); // Re-run when scan data updates

  if (isLoading) return <div>Analyzing body composition trends...</div>;
  if (error) return <div>Failed to load insights.</div>;
  if (!insight) return null;

  return (
    <div className="p-4 rounded-lg bg-card text-card-foreground">
      <h3 className="font-bold text-lg mb-2">Crispy Duck AI Analysis</h3>
      <div className="prose prose-sm dark:prose-invert">{insight}</div>
    </div>
  );
};

export default StatsAiInsights;
