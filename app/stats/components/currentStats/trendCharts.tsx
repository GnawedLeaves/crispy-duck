"use client";

import { LineChart } from "@/app/components/charts/tremor/LineChart";
import { ScanDataKey, TremorLineGraphColor } from "@/app/types/commonTypes";
import { BodyScanDataPoint } from "@/app/utils/supabase/getBodyScanDataAction";

export const TREND_CHARTS: {
  label: string;
  key: ScanDataKey;
  formatter: (n: number) => string;
}[] = [
  {
    label: "Total Weight (kg)",
    key: "totalWeight",
    formatter: (n) => `${n} kg`,
  },
  {
    label: "Fat Percentage (%)",
    key: "fatpercentage",
    formatter: (n) => `${n}%`,
  },
  {
    label: "Muscle Mass (kg)",
    key: "muscleMass",
    formatter: (n) => `${n} kg`,
  },
  { label: "Fat Mass (kg)", key: "fatMass", formatter: (n) => `${n} kg` },
  {
    label: "Metabolic Age (years)",
    key: "metabolicAge",
    formatter: (n) => `${n}`,
  },
  {
    label: "BMI",
    key: "bmi",
    formatter: (n) => `${n}`,
  },
  {
    label: "Total Body Water (%)",
    key: "tbwPercentage",
    formatter: (n) => `${n} %`,
  },
];

export function getAxisRange(
  data: BodyScanDataPoint[],
  key: ScanDataKey,
  paddingPct = 0.05,
) {
  const values = data.map((d) => d[key]).filter(Boolean);
  if (!values.length) return {};
  const min = Math.min(...values);
  const max = Math.max(...values);
  const padding = (max - min) * paddingPct;
  return {
    minValue: Math.floor(min - padding),
    maxValue: Math.ceil(max + padding),
  };
}

interface TrendChartsProps {
  trendData: BodyScanDataPoint[];
  graphColor: TremorLineGraphColor;
}

// Shared between the live stats page and the AI analysis detail view, so a
// saved analysis can "replay" the exact charts it was generated from.
const TrendCharts = ({ trendData, graphColor }: TrendChartsProps) => {
  return (
    <div className="flex flex-col gap-6">
      {TREND_CHARTS.map(({ label, key, formatter }) => {
        const chartFriendlyData = trendData.map((item) => ({
          ...item,
          [label]: item[key],
        }));

        return (
          <div key={key} className="cardWithShadow">
            <div className="text-2xl font-semibold mb-1">{label}</div>
            <LineChart
              className="h-48"
              data={chartFriendlyData}
              colors={[graphColor]}
              index="axisDate"
              categories={[label]}
              valueFormatter={formatter}
              onValueChange={(v: any) => {}}
              {...getAxisRange(trendData, key)}
            />
          </div>
        );
      })}
    </div>
  );
};

export default TrendCharts;
