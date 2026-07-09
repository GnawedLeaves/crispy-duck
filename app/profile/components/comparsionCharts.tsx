"use client";
import { LineChart } from "@/app/components/charts/tremor/LineChart";
import { useAuth } from "@/app/context/AuthContext";
import { tremorHexColors } from "@/app/stats/components/currentStats/colorSelectionComponent";
import {
  ScanDataKey,
  ComparisonScanDataKey,
  ComparisonDataPoint,
  TremorColorItem,
} from "@/app/types/commonTypes";
import { getRandomTremorColor } from "@/app/utils/common";
import { BodyScanDataPoint } from "@/app/utils/supabase/getBodyScanDataAction";
import { useEffect, useMemo } from "react";

interface ComparisonContentProps {
  weightComparisonData: ComparisonDataPoint[];
  fatComparisonData: ComparisonDataPoint[];
  muscleMassComparison: ComparisonDataPoint[];
  friendProfile: {
    id: any;
    username: any;
    display_name: any;
    avatar_url: any;
    sex: any;
    birthday: any;
    created_at: any;
    graphColor: any;
  } | null;
}

const ComparisonContent = ({
  weightComparisonData,
  fatComparisonData,
  muscleMassComparison,
  friendProfile,
}: ComparisonContentProps) => {
  const { user } = useAuth();

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
  const userGraphColors = useMemo(() => {
    const userColor = user?.profile?.graphColor;
    const friendColor = friendProfile?.graphColor;

    if (userColor !== friendColor) {
      return [userColor, friendColor];
    }
    // case: user and friend have same colour and both are amber
    if (userColor === "amber" && userColor === friendColor) {
      return [userColor, "cyan"];
    }

    // case: user and friend have same colour and its not amber, then set friend to amber
    return [userColor, "amber"];
  }, [friendProfile, user]);

  const randomFriendColorTest = getRandomTremorColor();

  return (
    <div>
      <div className="flex flex-col gap-6">
        {charts.map((chart) => {
          return (
            <div key={chart.key} className="cardWithShadow">
              <div className="text-2xl font-semibold mb-1">{chart.label}</div>
              <LineChart
                className="h-48 "
                colors={userGraphColors}
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
