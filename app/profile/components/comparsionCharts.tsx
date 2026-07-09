"use client";
import { LineChart } from "@/app/components/charts/tremor/LineChart";
import { useAuth } from "@/app/context/AuthContext";
import { ScanDataKey, ComparisonDataPoint } from "@/app/types/commonTypes";
import { useMemo } from "react";

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

  const isLoading = !user || !friendProfile;

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
    if (!user || !friendProfile) return ["gray", "amber"];

    const userColor = user?.profile?.graphColor;
    const friendColor = friendProfile?.graphColor;

    if (userColor !== friendColor) {
      return [userColor, friendColor];
    }
    if (userColor === "amber" && userColor === friendColor) {
      return [userColor, "cyan"];
    }
    return [userColor, "amber"];
  }, [friendProfile, user]);

  if (isLoading) {
    return (
      <div className="w-full h-[40vh] flex flex-col gap-4 justify-center items-center">
        <span className="loading loading-spinner loading-md" />
        <div className="text-sm text-neutral-400">
          Loading comparison data...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-6">
        {charts.map((chart) => (
          <div key={chart.key} className="cardWithShadow">
            <div className="text-2xl font-semibold mb-1">{chart.label}</div>
            <LineChart
              className="h-48"
              colors={userGraphColors}
              data={chart.data}
              index="axisDate"
              categories={chart.categories}
              valueFormatter={chart.formatter}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComparisonContent;
