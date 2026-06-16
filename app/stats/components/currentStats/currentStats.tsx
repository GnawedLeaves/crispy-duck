"use client";

import { BodyScanDataPoint } from "@/app/utils/supabase/getBodyScanDataAction";
import ProgressBarStatItem from "./progressBarStatItem";
import { LineChart } from "@/app/components/charts/tremor/LineChart";
import { useRouter } from "next/navigation";
import { withDelay } from "@/app/utils/common";
import { startTransition, ViewTransition } from "react";

interface CurrentStatsComponentProps {
  trendData: BodyScanDataPoint[];
}

type DataKey = "Total Weight" | "Fat Percentage" | "Muscle Mass" | "Fat Mass";

function getAxisRange(
  data: BodyScanDataPoint[],
  key: DataKey,
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

const CurrentStatsComponent = ({ trendData }: CurrentStatsComponentProps) => {
  const latestScan = trendData?.[trendData.length - 1];
  const router = useRouter();
  const handlePushToScan = withDelay(() => {
    startTransition(() => {
      router.push("/scan");
    });
  });
  const charts: {
    label: string;
    key: DataKey;
    formatter: (n: number) => string;
  }[] = [
    {
      label: "Total Weight (kg)",
      key: "Total Weight",
      formatter: (n) => `${n} kg`,
    },
    {
      label: "Fat Percentage (%)",
      key: "Fat Percentage",
      formatter: (n) => `${n}%`,
    },
    {
      label: "Muscle Mass (kg)",
      key: "Muscle Mass",
      formatter: (n) => `${n} kg`,
    },
    { label: "Fat Mass (kg)", key: "Fat Mass", formatter: (n) => `${n} kg` },
  ];

  return (
    <div className="cardWithShadow">
      <div className="text-xl font-bold">Current Stats</div>
      <div>TOTAL SCANS: {trendData?.length}</div>
      <button className="standardButton" onClick={handlePushToScan}>
        Start scanning
      </button>

      {trendData?.length > 0 && (
        <div className="flex flex-col gap-4">
          <ProgressBarStatItem
            title="Fat Percentage"
            progressPercentage={latestScan?.["Fat Percentage"] ?? 0}
            progressString={`${latestScan?.["Fat Percentage"] ?? "--"}%`}
          />
          <ProgressBarStatItem
            title="Muscle Mass"
            progressPercentage={latestScan?.["Muscle Mass"] ?? 0}
            progressString={`${latestScan?.["Muscle Mass"] ?? "--"} kg`}
          />
          <ProgressBarStatItem
            title="Fat Mass"
            progressPercentage={latestScan?.["Fat Mass"] ?? 0}
            progressString={`${latestScan?.["Fat Mass"] ?? "--"} kg`}
          />
        </div>
      )}

      {trendData?.length > 0 && (
        <div className="flex flex-col gap-6 mt-6">
          {charts.map(({ label, key, formatter }) => (
            <div key={key}>
              <div className="text-2xl font-semibold mb-1">{label}</div>
              <LineChart
                className="h-48"
                data={trendData}
                index="date"
                categories={[key]}
                valueFormatter={formatter}
                onValueChange={(v: any) => console.log(v)}
                {...getAxisRange(trendData, key)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CurrentStatsComponent;
