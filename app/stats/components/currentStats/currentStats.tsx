"use client";

import { BodyScanDataPoint } from "@/app/utils/supabase/getBodyScanDataAction";
import ProgressBarStatItem from "./progressBarStatItem";
import { LineChart } from "@/app/components/charts/tremor/LineChart";
import { useRouter } from "next/navigation";
import { withDelay } from "@/app/utils/common";
import { startTransition } from "react";
import { ScanDataKey } from "@/app/types/commonTypes";

interface CurrentStatsComponentProps {
  trendData: BodyScanDataPoint[];
  isViewingFriend?: boolean;
}

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

const CurrentStatsComponent = ({
  trendData,
  isViewingFriend = false,
}: CurrentStatsComponentProps) => {
  const latestScan = trendData?.[trendData.length - 1];
  const router = useRouter();
  const handlePushToScan = withDelay(() => {
    startTransition(() => {
      router.push("/scan");
    });
  });
  const charts: {
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
    // {
    //   label: "Visceral Fat Rating",
    //   key: "visceralFatRating",
    //   formatter: (n) => `${n}`,
    // },
  ];

  return (
    <div>
      <div className="text-3xl text-center mb-4 font-bold">
        Stats ({trendData?.length})
      </div>

      {trendData?.length < 1 && (
        <div className="flex flex-col gap-2 mt-6">
          <div className="text-2xl text-center  ">
            {isViewingFriend
              ? "Your friend doesn't have any scans. Tell them to start scanning!"
              : "You don't have any scans..."}
          </div>
          {!isViewingFriend && (
            <button className="standardButton" onClick={handlePushToScan}>
              Start scanning
            </button>
          )}
        </div>
      )}
      {latestScan?.date && <div>Latest scan: {latestScan?.date}</div>}
      {trendData?.length > 0 && (
        <div className="flex flex-col gap-4 mt-2">
          <ProgressBarStatItem
            title="Fat %"
            progressPercentage={latestScan?.["fatpercentage"] ?? 0}
            progressString={`${latestScan?.["fatpercentage"] ?? "--"}%`}
          />
          <ProgressBarStatItem
            title="Total Body Water %"
            progressPercentage={latestScan?.["tbwPercentage"] ?? 0}
            progressString={`${latestScan?.["tbwPercentage"] ?? "--"}%`}
          />
        </div>
      )}

      {trendData?.length > 0 && (
        <div className="flex flex-col gap-6 mt-6 ">
          {charts.map(({ label, key, formatter }) => {
            // Create a temporary data array where the raw data key
            // is cloned onto a property named after your pretty label
            const chartFriendlyData = trendData.map((item) => ({
              ...item,
              [label]: item[key],
            }));

            return (
              <div key={key} className="cardWithShadow">
                <div className="text-2xl font-semibold mb-1">{label}</div>
                <LineChart
                  className="h-48 "
                  data={chartFriendlyData}
                  colors={["amber"]}
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
      )}
    </div>
  );
};

export default CurrentStatsComponent;
