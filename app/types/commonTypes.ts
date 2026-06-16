export interface ITautaScanData {
  /** The calculated Body Mass Index (BMI) */
  bmi: number;

  /** Basal Metabolic Rate (typically in kJ or kcal depending on parsed preference) */
  bmr: number;

  /** Total bone mass weight in kilograms (kg) */
  boneMass: number;

  /** Weight allowance deducted for clothing in kilograms (kg) */
  clothesWeight: number;

  /** Calculated percentage over the ideal body weight (%) */
  degreeOfObesity: number;

  /** Total fat mass weight in kilograms (kg) */
  fatMass: number;

  /** Overall body fat percentage (%) */
  fatPercentage: number;

  /** Fat-Free Mass in kilograms (kg) */
  ffm: number;

  /** Target healthy weight for the individual in kilograms (kg) */
  idealBodyWeight: number;

  /** Calculated metabolic age based on cellular health/vitals (years) */
  metabolicAge: number;

  /** Total skeletal muscle mass weight in kilograms (kg) */
  muscleMass: number;

  /** The parsed date of the scan (Format: "DD/MMM/YYYY") */
  scanDate: string;

  /** The parsed time of the scan (Format: "HH:mm") */
  scanTime: string;

  /** Total Body Water weight in kilograms (kg) */
  tbw: number;

  /** Total Body Water percentage (%) */
  tbwPercent: number;

  /** Visceral fat rating score (typically indexed 1-59) */
  visceralFatRating: number;

  /** Total measured body weight before clothing deductions in kilograms (kg) */
  weight: number;
}

export type SignUpPageState =
  | "email"
  | "password"
  | "displayName"
  | "birthday "
  | "sex";

export type PageState = "landing" | "login" | "signUp";
