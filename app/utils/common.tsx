import { ITautaScanData, TremorColorItem } from "../types/commonTypes";
import maleDefaultAvatar from "../assets/default_profile_pic_male.png";
import femaleDefaultAvatar from "../assets/default_profile_pic_female.png";
import nbDefaultAvatar from "../assets/default_profile_pic_NA.png";
import duck1 from "../assets/duck_1.png";
import duck2 from "../assets/duck_1.png";
import duck3 from "../assets/duck_1.png";

import { tremorHexColors } from "../stats/components/currentStats/colorSelectionComponent";

export interface ComparisonDataPoint {
  axisDate: string;
  [key: string]: string | number | undefined;
}

export const withDelay = <T extends any[]>(
  callback: (...args: T) => void,
  ms: number = 300,
) => {
  // accept the arguments here using the rest operator (...args)
  return (...args: T) => {
    // pass those arguments into the callback inside setTimeout
    setTimeout(() => callback(...args), ms);
  };
};
const mapping: Record<string, string> = {
  WEIGHT: "weight",
  "CLOTHES WEIGHT": "clothesWeight",
  "FAT %": "fatPercentage",
  "MUSCLE MASS": "muscleMass",
  BMI: "bmi",
  "FAT MASS": "fatMass",
  FFM: "ffm",
  TBW: "tbw",
  "TBW %": "tbwPercent",
  "BONE MASS": "boneMass",
  BMR: "bmr",
  "METABOLIC AGE": "metabolicAge",
  "VISCERAL FAT RATING": "visceralFatRating",
  "IDEAL BODY WEIGHT": "idealBodyWeight",
  "DEGREE OF OBESITY": "degreeOfObesity",
};

export function parseTautaScan(rawText: string) {
  const data: Record<string, any> = {};

  // 1. Extract Metadata globally first (Date & Time)
  // Matches "16/JAN/2056 13:33"
  const dateResultMatch = rawText.match(
    /(\d{1,2}\/[A-Z]{3}\/\d{4})\s+(\d{2}:\d{2})/,
  );
  if (dateResultMatch) {
    data.scanDate = dateResultMatch[1];
    data.scanTime = dateResultMatch[2];
  }

  // 2. Split the document into clean sections to avoid cross-contamination
  // We look for the main uppercase headers
  const inputSection = rawText.split("RESULT")[0] || "";

  // Isolate just the text between "RESULT" and "DESIRABLE RANGE"
  const resultPart = rawText.split("RESULT")[1] || "";
  const resultSection = resultPart.split("DESIRABLE RANGE")[0] || "";

  // 3. Helper to parse key-value lines from a specific section string
  const parseSection = (
    sectionText: string,
    targets: Record<string, string>,
  ) => {
    const lines = sectionText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    lines.forEach((line, index) => {
      // Check if the current line matches one of our target keys exactly
      // Handling inline adjustments like "VISCERAL FAT RATING 14" vs "WEIGHT \n 96.4"
      Object.keys(targets).forEach((label) => {
        if (line === label || line.startsWith(label)) {
          let valueCandidate = "";

          if (line === label) {
            // Value is on the next line
            valueCandidate = lines[index + 1] || "";
          } else {
            // Value is on the same line (e.g. "VISCERAL FAT RATING 14")
            valueCandidate = line.replace(label, "").trim();
          }

          // Clean up the text: fix OCR 'O' typo to '0', and extract numbers/decimals
          const cleanValue = valueCandidate.replace(/O/g, "0").match(/[\d\.]+/);

          if (cleanValue) {
            data[targets[label]] = parseFloat(cleanValue[0]);
          }
        }
      });
    });
  };

  // 4. Execute parsing within bounded contexts
  // Parse "CLOTHES WEIGHT" from the input section
  parseSection(inputSection, { "CLOTHES WEIGHT": "clothesWeight" });

  // Parse all vital stats exclusively from the results section
  parseSection(resultSection, mapping);

  return data as ITautaScanData;
}

export const handleEmptyProfilePic = (sex?: string, avatar_url?: any) => {
  if (
    avatar_url &&
    typeof avatar_url === "string" &&
    !avatar_url.includes("[object Object]")
  ) {
    return avatar_url;
  }

  if (sex === "M") return duck1;
  if (sex === "F") return duck2;
  return duck3;
};

type DataPoint = { axisDate: string; [key: string]: any };

interface MergeConfig {
  userLabel: string; // e.g., "My Weight"
  friendLabel: string; // e.g., "Friend Weight"
  dataKey: string; // e.g., "totalWeight"
}

export function mergeAndFillTrendData(
  userData: DataPoint[],
  friendData: DataPoint[],
  config: MergeConfig,
): ComparisonDataPoint[] {
  const { userLabel, friendLabel, dataKey } = config;

  // 1. Gather all unique dates across both arrays and sort them chronologically
  const allDates = Array.from(
    new Set([
      ...userData.map((d) => d.axisDate),
      ...friendData.map((d) => d.axisDate),
    ]),
  ).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  // Convert arrays to quick-lookup maps keyed by date
  const userMap = new Map(userData.map((d) => [d.axisDate, d[dataKey]]));
  const friendMap = new Map(friendData.map((d) => [d.axisDate, d[dataKey]]));

  // Keep track of the last seen valid numbers for forward-filling
  let lastUserValue: number | null = null;
  let lastFriendValue: number | null = null;

  // 2. Iterate through the master timeline and fill gaps
  const comparisonData = allDates.map((date) => {
    // Check if there's a new value on this date; otherwise, fallback to the last seen value
    const currentUserValue = userMap.has(date)
      ? userMap.get(date)
      : lastUserValue;
    const currentFriendValue = friendMap.has(date)
      ? friendMap.get(date)
      : lastFriendValue;

    // Update our "previous data point" trackers for the next loop iteration
    if (currentUserValue !== null) lastUserValue = currentUserValue;
    if (currentFriendValue !== null) lastFriendValue = currentFriendValue;

    return {
      axisDate: date,
      [userLabel]: currentUserValue,
      [friendLabel]: currentFriendValue,
    };
  });

  // Optional: If a user or friend doesn't have a value for the absolute earliest date,
  // you might want to backward-fill it or filter it out so it doesn't show null.
  return comparisonData;
}

export const getRandomTremorColor = (): TremorColorItem => {
  const randomIndex = Math.floor(Math.random() * tremorHexColors.length);
  return tremorHexColors[randomIndex];
};
