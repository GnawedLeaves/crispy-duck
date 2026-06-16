import { ITautaScanData } from "../types/commonTypes";

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
