"use client";

import useFriendController from "@/app/friends/friendController";
import CurrentStatsComponent from "@/app/stats/components/currentStats/currentStats";
import { token } from "@/app/theme";
import { handleEmptyProfilePic } from "@/app/utils/common";
import { BodyScanDataPoint } from "@/app/utils/supabase/getBodyScanDataAction";
import dayjs from "dayjs";
import Image from "next/image";
import { useEffect, useState } from "react";

interface FriendContentProps {
  friendId: string;
  friendTrendData: BodyScanDataPoint[];
}

const FriendContent = ({ friendId, friendTrendData }: FriendContentProps) => {
  const { getFriendProfile } = useFriendController({});

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const friendProfile = await getFriendProfile(friendId);
      console.log({ friendProfile });
      setProfile(friendProfile);
      setLoading(false);
    };

    fetchProfile();
  }, [friendId]);

  if (loading) return <div>Loading profile...</div>;
  if (!profile) return <div>Profile not found.</div>;

  return (
    <div>
      <div className="flex gap-6">
        <Image
          src={handleEmptyProfilePic(profile.sex, profile.avatar_url)}
          alt="profile_picture"
          width={100}
          height={100}
          className="object-cover rounded-full aspect-square border-2 border-black"
        />
        <div className="flex flex-col justify-center gap-1">
          <div className="text-3xl font-bold">{profile.display_name}</div>
          <div className="text-sm">@{profile.username}</div>
        </div>
      </div>
      <div className="flex flex-col gap-1 my-4">
        <div className="text-md">
          Date Joined: {dayjs(profile.created_at).format("DD MMM YYYY")}
        </div>
        <div className="text-md">
          Birthday: {dayjs(profile.birthday).format("DD MMM YYYY")}
        </div>
      </div>
      <div
        className="w-full border-t-2"
        style={{ borderColor: token.light.borderColor }}
      ></div>
      <div className="mt-6">
        <CurrentStatsComponent
          trendData={friendTrendData}
          isViewingFriend={true}
        />
      </div>
    </div>
  );
};

export default FriendContent;
