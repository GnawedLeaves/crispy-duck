"use server";

import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";
import { BodyScanDataPoint } from "./getBodyScanDataAction";
import { AiAnalysisRow, AiAnalysisSummary } from "./aiAnalysisTypes";

export const saveAiAnalysis = async (
  analysisText: string,
  trendData: BodyScanDataPoint[],
  currentUserId: string,
) => {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.from("ai_analyses").insert([
    {
      user_id: currentUserId,
      analysis_text: analysisText,
      trend_data: trendData,
    },
  ]);

  return { data, error };
};

export const getUserAiAnalyses = async () => {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      data: null,
      error: { message: "Unauthorized access.", code: "401" },
    };
  }

  const { data, error } = await supabase
    .from("ai_analyses")
    .select("id, analysis_text, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return {
      data: null,
      error: { message: error.message, code: error.code },
    };
  }

  return { data: data as AiAnalysisSummary[], error: null };
};

export const getAiAnalysisById = async (analysisId: string) => {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      data: null,
      error: { message: "Unauthorized access.", code: "401" },
    };
  }

  const { data, error } = await supabase
    .from("ai_analyses")
    .select("id, analysis_text, trend_data, created_at")
    .eq("id", analysisId)
    .eq("user_id", user.id)
    .single();

  if (error) {
    return {
      data: null,
      error: { message: error.message, code: error.code },
    };
  }

  return { data: data as AiAnalysisRow, error: null };
};

export const deleteAiAnalysis = async (
  analysisId: string,
  currentUserId: string,
) => {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("ai_analyses")
    .delete()
    .eq("id", analysisId)
    .eq("user_id", currentUserId);

  return { data, error };
};
