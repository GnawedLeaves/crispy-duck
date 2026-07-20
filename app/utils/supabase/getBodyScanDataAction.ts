"use server";

import { createClient } from "@/app/utils/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";
import dayjs from "dayjs";
import { cookies } from "next/headers";

export interface BodyScanDataPoint {
  date: string;
  totalWeight: number;
  fatpercentage: number;
  muscleMass: number;
  fatMass: number;
  tbwPercentage: number;
  metabolicAge: number;
  bmi: number;
  visceralFatRating: number;
  axisDate: string;
}

async function fetchBodyScanData(
  supabase: SupabaseClient,
  userId: string,
  limit = 15,
): Promise<BodyScanDataPoint[]> {
  const { data, error } = await supabase
    .from("tanita_scans")
    .select(
      "scan_date, weight, fat_percentage, muscle_mass, fat_mass,tbw_percent, metabolic_age,bmi,visceral_fat_rating",
    )
    .eq("user_id", userId)
    .order("scan_date", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  return (data ?? [])
    .map((row) => ({
      date: dayjs(row.scan_date).format("DD MMM YYYY"),
      axisDate: dayjs(row.scan_date).format("DD MMM YY"),
      totalWeight: parseFloat(row.weight),
      fatpercentage: parseFloat(row.fat_percentage),
      muscleMass: parseFloat(row.muscle_mass),
      fatMass: parseFloat(row.fat_mass),
      tbwPercentage: parseFloat(row.tbw_percent),
      metabolicAge: parseFloat(row.metabolic_age),
      bmi: parseFloat(row.bmi),
      visceralFatRating: parseFloat(row.visceral_fat_rating),
    }))
    .reverse() as BodyScanDataPoint[];
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

export async function getBodyScanDataFromFriend(
  userId: string,
): Promise<BodyScanDataPoint[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  return fetchBodyScanData(supabase, userId);
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
