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

type DataKey =
  | "Total Weight"
  | "Fat Percentage"
  | "Muscle Mass"
  | "Fat Mass"
  | "Total Body Water Percentage";

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
    <div>
      <div className="text-4xl text-center mb-4 font-bold">
        Stats ({trendData?.length})
      </div>

      {trendData?.length < 1 && (
        <div className="flex flex-col gap-2 mt-6">
          <div className="text-2xl text-center  ">
            You don't have any scans...{" "}
          </div>
          <button className="standardButton" onClick={handlePushToScan}>
            Start scanning
          </button>
        </div>
      )}

      <div>Latest scan: {latestScan.date}</div>
      {trendData?.length > 0 && (
        <div className="flex flex-col gap-4 mt-2">
          {/* <div className="text-xl font-bold text-center">Current Stats</div> */}
          <ProgressBarStatItem
            title="Fat Percentage"
            progressPercentage={latestScan?.["Fat Percentage"] ?? 0}
            progressString={`${latestScan?.["Fat Percentage"] ?? "--"}%`}
          />
          <ProgressBarStatItem
            title="Total Body Water Percentage"
            progressPercentage={
              latestScan?.["Total Body Water Percentage"] ?? 0
            }
            progressString={`${latestScan?.["Total Body Water Percentage"] ?? "--"}%`}
          />
        </div>
      )}

      {trendData?.length > 0 && (
        <div className="flex flex-col gap-6 mt-6 ">
          {charts.map(({ label, key, formatter }) => (
            <div key={key} className="cardWithShadow">
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
