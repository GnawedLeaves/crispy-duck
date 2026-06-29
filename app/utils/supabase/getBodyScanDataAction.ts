"use server";

import { createClient } from "@/app/utils/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export interface BodyScanDataPoint {
  date: string;
  "Total Weight": number;
  "Fat Percentage": number;
  "Muscle Mass": number;
  "Fat Mass": number;
}

async function fetchBodyScanData(
  supabase: SupabaseClient,
  userId: string,
  limit = 10,
): Promise<BodyScanDataPoint[]> {
  const { data, error } = await supabase
    .from("tanita_scans")
    .select("scan_date, weight, fat_percentage, muscle_mass, fat_mass")
    .eq("user_id", userId)
    .order("scan_date", { ascending: true })
    .limit(limit);

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    date: new Date(row.scan_date).toLocaleDateString("en-SG", {
      month: "short",
      day: "numeric",
    }),
    "Total Weight": parseFloat(row.weight),
    "Fat Percentage": parseFloat(row.fat_percentage),
    "Muscle Mass": parseFloat(row.muscle_mass),
    "Fat Mass": parseFloat(row.fat_mass),
  }));
}

export async function getBodyScanData(): Promise<BodyScanDataPoint[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return [];
  return fetchBodyScanData(supabase, user.id);
}

// New: same query, different user_id — RLS does the gating.
// Returns [] (not an error) if the target isn't a friend, since
// the policy just filters rows rather than throwing.
export async function getFriendBodyScanData(
  friendId: string,
): Promise<BodyScanDataPoint[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  return fetchBodyScanData(supabase, friendId);
}
