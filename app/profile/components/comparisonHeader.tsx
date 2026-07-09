"use client";
import { useAuth } from "@/app/context/AuthContext";
import useFriendController from "@/app/friends/friendController";
import {
  getRandomTremorColor,
  handleEmptyProfilePic,
} from "@/app/utils/common";
import { profile } from "console";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { TremorColorItem, TremorLineGraphColor } from "@/app/types/commonTypes";
import { tremorHexColors } from "@/app/stats/components/currentStats/colorSelectionComponent";

interface ComparisonHeaderProps {
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

const ComparisonHeader = ({ friendProfile }: ComparisonHeaderProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const userGraphColors = useMemo(() => {
    const userColor = user?.profile?.graphColor;
    const friendColor = friendProfile?.graphColor;
    const userColorHex =
      tremorHexColors.find((color) => color.name === userColor)?.hexCode ||
      "#f59e0b";
    const friendColorHex =
      tremorHexColors.find((color) => color.name === friendColor)?.hexCode ||
      "#f59e0b";

    if (userColor !== friendColor) {
      return [userColorHex, friendColorHex];
    }
    // case: user and friend have same colour and both are amber
    if (userColor === "amber" && userColor === friendColor) {
      return [userColorHex, "#06b6d4"];
    }

    // case: user and friend have same colour and its not amber, then set friend to amber
    return [userColorHex, "#f59e0b"];
  }, [friendProfile, user]);

  if (loading || !user)
    return (
      <div className="mb-8 flex items-center justify-center">
        <span className="loading loading-spinner loading-md" />
      </div>
    );
  return (
    <div className="mb-8">
      <div className="text-3xl font-bold text-center mb-4">Compare Mode</div>
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-2 items-center">
          <Image
            src={handleEmptyProfilePic(
              user?.profile?.sex,
              user?.profile?.avatar_url,
            )}
            alt="profile_picture"
            width={150}
            height={150}
            className="object-cover rounded-full aspect-square border-4"
            style={{
              // borderColor: `var(--${userGraphColors[0]}-500, currentColor)`,
              borderColor: userGraphColors[0],
            }}
          />
          <div className="text-lg">{user.profile?.display_name}</div>
        </div>

        <div className="text-2xl">vs</div>
        <div className="flex flex-col gap-2 items-center">
          <Image
            src={handleEmptyProfilePic(
              friendProfile?.sex,
              friendProfile?.avatar_url,
            )}
            alt="profile_picture"
            width={150}
            height={150}
            className="object-cover rounded-full aspect-square border-4"
            style={{
              // borderColor: `var(--${userGraphColors[1]}-500, currentColor)`,
              borderColor: userGraphColors[1],
            }}
          />
          <div className="text-lg">{friendProfile?.display_name}</div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonHeader;
