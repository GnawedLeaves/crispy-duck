import {
  getBodyScanData,
  getBodyScanDataFromFriend,
} from "@/app/utils/supabase/getBodyScanDataAction";
import ComparisonContent from "../../components/comparsionCharts";
import {
  getRandomTremorColor,
  mergeAndFillTrendData,
} from "@/app/utils/common";
import ComparisonHeader from "../../components/comparisonHeader";
import { getFriendProfile } from "@/app/utils/supabase/friendAction";

interface CompareWithFriendPageProps {
  params: Promise<{ userId: string }>;
}
const CompareWithFriendPage = async ({
  params,
}: CompareWithFriendPageProps) => {
  const { userId: friendId } = await params;

  const friendTrendData = await getBodyScanDataFromFriend(friendId);
  const userTrendData = await getBodyScanData();

  const weightComparisonData = mergeAndFillTrendData(
    userTrendData,
    friendTrendData,
    {
      userLabel: "My Weight",
      friendLabel: "Friend Weight",
      dataKey: "totalWeight",
    },
  );

  const fatComparisonData = mergeAndFillTrendData(
    userTrendData,
    friendTrendData,
    {
      userLabel: "My Fat %",
      friendLabel: "Friend Fat %",
      dataKey: "fatpercentage",
    },
  );

  const muscleMassComparison = mergeAndFillTrendData(
    userTrendData,
    friendTrendData,
    {
      userLabel: "My Muscle Mass",
      friendLabel: "Friend Muscle Mass",
      dataKey: "muscleMass",
    },
  );

  const friendProfile = await getFriendProfile(friendId);
  const randomFriendColor = getRandomTremorColor();

  return (
    <div className="contentLayout">
      <ComparisonHeader friendProfile={friendProfile} />
      <ComparisonContent
        friendProfile={friendProfile}
        weightComparisonData={weightComparisonData}
        fatComparisonData={fatComparisonData}
        muscleMassComparison={muscleMassComparison}
      />
    </div>
  );
};

export default CompareWithFriendPage;
