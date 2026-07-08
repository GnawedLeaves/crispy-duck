"use client";
import { LineChart } from "@/app/components/charts/tremor/LineChart";
import { useAuth } from "@/app/context/AuthContext";
import {
  ScanDataKey,
  ComparisonScanDataKey,
  ComparisonDataPoint,
} from "@/app/types/commonTypes";
import { BodyScanDataPoint } from "@/app/utils/supabase/getBodyScanDataAction";
import { useEffect, useMemo } from "react";

interface ComparisonContentProps {
  weightComparisonData: ComparisonDataPoint[];
  fatComparisonData: ComparisonDataPoint[];
  muscleMassComparison: ComparisonDataPoint[];
}

const ComparisonContent = ({
  weightComparisonData,
  fatComparisonData,
  muscleMassComparison,
}: ComparisonContentProps) => {
  const charts: {
    categories: string[];
    key: ScanDataKey;
    label: string;
    formatter: (n: number) => string;
    data: ComparisonDataPoint[];
  }[] = [
    {
      categories: ["My Weight", "Friend Weight"],
      key: "totalWeight",
      label: "Total Weight (kg)",
      formatter: (n) => `${n} kg`,
      data: weightComparisonData,
    },
    {
      categories: ["My Fat %", "Friend Fat %"],
      key: "fatpercentage",
      label: "Fat %",
      formatter: (n) => `${n} %`,
      data: fatComparisonData,
    },
    {
      categories: ["My Muscle Mass", "Friend Muscle Mass"],
      key: "muscleMass",
      label: "Muscle Mass (kg)",
      formatter: (n) => `${n} kg`,
      data: muscleMassComparison,
    },
  ];

  return (
    <div>
      <div className="flex flex-col gap-6">
        {charts.map((chart) => {
          return (
            <div key={chart.key} className="cardWithShadow">
              <div className="text-2xl font-semibold mb-1">{chart.label}</div>
              <LineChart
                className="h-48 "
                colors={["amber", "emerald"]}
                data={chart.data}
                index="axisDate"
                categories={chart.categories}
                valueFormatter={chart.formatter}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ComparisonContent;
