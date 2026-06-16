"use server";

import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";

export type BodyScanDataPoint = {
  date: string;
  "Total Weight": number;
  "Fat Percentage": number;
  "Muscle Mass": number;
  "Fat Mass": number;
};

export async function getBodyScanData(): Promise<BodyScanDataPoint[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return [];

  const { data, error } = await supabase
    .from("tanita_scans")
    .select("scan_date, weight, fat_percentage, muscle_mass, fat_mass")
    .eq("user_id", user.id)
    .order("scan_date", { ascending: true })
    .limit(10);

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
