import { ITautaScanData } from "@/app/types/commonTypes";

export interface TanitaScanRow {
  id: string;
  user_id: string;
  scan_date: string;
  scan_time: string;
  weight: number;
  clothes_weight: number;
  fat_percentage: number;
  fat_mass: number;
  ffm: number;
  muscle_mass: number;
  tbw: number;
  tbw_percent: number;
  bone_mass: number;
  bmr: number;
  metabolic_age: number;
  visceral_fat_rating: number;
  bmi: number;
  degree_of_obesity: number | null;
  ideal_body_weight: number | null;
  scan_image_id: string | null;
}

// Reverses the mapping in uploadScanData/updateScanData, so a saved row can be
// fed back into ITautaScanData-shaped forms (e.g. EditFormView) for editing.
export const mapScanRowToScanData = (row: TanitaScanRow): ITautaScanData => ({
  bmi: row.bmi,
  bmr: row.bmr,
  boneMass: row.bone_mass,
  clothesWeight: row.clothes_weight,
  degreeOfObesity: row.degree_of_obesity as any,
  fatMass: row.fat_mass,
  fatPercentage: row.fat_percentage,
  ffm: row.ffm,
  idealBodyWeight: row.ideal_body_weight as any,
  metabolicAge: row.metabolic_age,
  muscleMass: row.muscle_mass,
  scanDate: row.scan_date,
  scanTime: row.scan_time,
  tbw: row.tbw,
  tbwPercent: row.tbw_percent,
  visceralFatRating: row.visceral_fat_rating,
  weight: row.weight,
});
