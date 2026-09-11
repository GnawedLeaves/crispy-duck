"use client";

import { useAuth } from "@/app/context/AuthContext";
import TrendCharts from "@/app/stats/components/currentStats/trendCharts";
import { AiAnalysisRow } from "@/app/utils/supabase/aiAnalysisTypes";
import dayjs from "dayjs";
import { Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface AiAnalysisDetailProps {
  analysis: AiAnalysisRow;
}

const AiAnalysisDetail = ({ analysis }: AiAnalysisDetailProps) => {
  const { user } = useAuth();
  const graphColor = user?.profile?.graphColor || "amber";

  return (
    <div className="flex flex-col gap-6 max-w-lg mx-auto w-full">
      <div className="text-center">
        <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5" />
          AI Analysis
        </h1>
        <p className="text-sm opacity-60">
          Generated {dayjs(analysis.created_at).format("DD MMM YYYY, HH:mm")}
        </p>
      </div>

      <div className="cardWithShadow">
        <div className="prose prose-sm dark:prose-invert [&_p]:mb-6 [&_ul]:mb-6 [&_li]:mb-3">
          <ReactMarkdown>{analysis.analysis_text}</ReactMarkdown>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">
          Stats at time of analysis
        </h2>
        <TrendCharts trendData={analysis.trend_data} graphColor={graphColor} />
      </div>
    </div>
  );
};

export default AiAnalysisDetail;
