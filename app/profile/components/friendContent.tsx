"use client";

import useFriendController from "@/app/friends/friendController";
import Image from "next/image";
import { useEffect, useState } from "react";

interface FriendContentProps {
  friendId: string;
}

const FriendContent = ({ friendId }: FriendContentProps) => {
  const { getFriendProfile } = useFriendController({});

  // 1. Create state to hold the data
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

  // 3. Handle loading/empty states
  if (loading) return <div>Loading profile...</div>;
  if (!profile) return <div>Profile not found.</div>;

  // 4. Render your UI with the data
  return (
    <div>
      <div className="flex gap-2">
        <Image
          src={profile.avatar_url}
          alt="profile_picture"
          width={100}
          height={100}
          className="object-cover rounded-full aspect-square border-2 border-black"
        />
        <div className="flex flex-col items-center bg-red-200">
          <h1>{profile.display_name}</h1>
          <p>@{profile.username}</p>
        </div>
      </div>
    </div>
  );
};

export default FriendContent;
