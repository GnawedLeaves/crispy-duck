"use client";
import { useAuth } from "@/app/context/AuthContext";
import useFriendController from "@/app/friends/friendController";
import { handleEmptyProfilePic } from "@/app/utils/common";
import { profile } from "console";
import { useEffect, useState } from "react";
import Image from "next/image";

interface ComparisonHeaderProps {
  friendId: string;
}

const ComparisonHeader = ({ friendId }: ComparisonHeaderProps) => {
  const { user } = useAuth();
  const [friendProfile, setFriendProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { getFriendProfile } = useFriendController({});
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const friendProfile = await getFriendProfile(friendId);
      setFriendProfile(friendProfile);
      setLoading(false);
    };

    fetchProfile();
  }, [friendId]);

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
            className="object-cover rounded-full aspect-square border-3 border-amber-500"
          />
          <div className="text-lg">{user.profile?.display_name}</div>
        </div>

        <div className="text-2xl">vs</div>
        <div className="flex flex-col gap-2 items-center">
          <Image
            src={handleEmptyProfilePic(
              friendProfile.sex,
              friendProfile.avatar_url,
            )}
            alt="profile_picture"
            width={150}
            height={150}
            className="object-cover rounded-full aspect-square border-3 border-emerald-500"
          />
          <div className="text-lg">{friendProfile.display_name}</div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonHeader;
