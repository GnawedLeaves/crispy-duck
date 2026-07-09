"use client";

import useFriendController from "@/app/friends/friendController";
import { tremorHexColors } from "@/app/stats/components/currentStats/colorSelectionComponent";
import CurrentStatsComponent from "@/app/stats/components/currentStats/currentStats";
import { token } from "@/app/theme";
import { handleEmptyProfilePic, withDelay } from "@/app/utils/common";
import { BodyScanDataPoint } from "@/app/utils/supabase/getBodyScanDataAction";
import dayjs from "dayjs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface FriendContentProps {
  friendId: string;
  friendTrendData: BodyScanDataPoint[];
}

const FriendContent = ({ friendId, friendTrendData }: FriendContentProps) => {
  const { getFriendProfile } = useFriendController({});
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const friendProfile = await getFriendProfile(friendId);
      setProfile(friendProfile);
      setLoading(false);
    };

    fetchProfile();
  }, [friendId]);

  const handleCompareClick = withDelay(() => {
    router.push(`/profile/compare/${friendId}`);
  });

  const graphColourHex = useMemo(() => {
    if (profile?.graphColor) {
      return (
        tremorHexColors.find((color) => color.name === profile?.graphColor)
          ?.hexCode || "#f59e0b"
      );
    } else return "#f59e0b";
  }, [profile]);

  if (loading)
    return (
      <div className="w-full h-[80vh] flex flex-col gap-8 justify-center items-center">
        <span className="loading loading-spinner loading-md" />
        <div className="text-sm text-muted-foreground">Loading profile...</div>
      </div>
    );
  if (!profile) return <div>Profile not found.</div>;
  return (
    <div>
      <div className="flex gap-6">
        <Image
          src={handleEmptyProfilePic(profile.sex, profile.avatar_url)}
          alt="profile_picture"
          width={100}
          height={100}
          className="object-cover rounded-full aspect-square border-4"
          style={{ borderColor: graphColourHex }}
        />
        <div className="flex flex-col justify-center gap-1">
          <div className="text-3xl font-bold">{profile.display_name}</div>
          <div className="text-sm">@{profile.username}</div>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1 my-4">
          <div className="text-md">
            Date Joined: {dayjs(profile.created_at).format("DD MMM YYYY")}
          </div>
          <div className="text-md">
            Birthday: {dayjs(profile.birthday).format("DD MMM YYYY")}
          </div>
        </div>
        {friendTrendData.length > 0 && (
          <div>
            <button
              className="standardButton"
              style={{ background: token.light.primaryColor }}
              onClick={handleCompareClick}
            >
              Compare Stats
            </button>
          </div>
        )}
      </div>

      <div
        className="w-full border-t-2"
        style={{ borderColor: token.light.borderColor }}
      ></div>

      <div className="mt-6">
        <CurrentStatsComponent
          trendData={friendTrendData}
          isViewingFriend={true}
          friendColor={profile.graphColor}
        />
      </div>
    </div>
  );
};

export default FriendContent;
