"use client";
import { useAuth } from "@/app/context/AuthContext";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import femaleDefaultAvatar from "../../assets/default_profile_pic_female.png";
import maleDefaultAvatar from "../../assets/default_profile_pic_male.png";
import naDefaultAvatar from "../../assets/default_profile_pic_NA.png";



const ProfileBanner = () => {
  const { user, refreshUser } = useAuth();
  useEffect(() => {
    refreshUser();
  }, []);
  console.log({ user });
  const userProfilePic = useMemo(() => {
    if (user?.profile?.avatar_url) {
      return user?.profile.avatar_url
    }
    else if (user?.profile?.sex === "M") {
      return maleDefaultAvatar
    }
    else if (user?.profile?.sex === "F") {
      return femaleDefaultAvatar
    }
    else {
      return naDefaultAvatar
    }
  }, [user])

  return (
    <div style={{ display: "flex", padding: "1rem 0rem", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <Link
          href="/profile"
          className="p-2 rounded-full inline-block transition-colors hover:opacity-80"

        >
          <Image src={userProfilePic} alt="avatar_image" width={60} />

        </Link>
        <div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>{user?.profile?.username}</div>
          <div style={{ fontSize: "14px" }}>{user?.profile?.bio ?? "looking cripsy"}</div>
        </div>
      </div>
      {/* <Link
        href="/profile"
        className="p-2 rounded-full inline-block transition-colors hover:opacity-80"
        style={{ background: token.light.primaryColor }} // Keeping your dynamic token color
      >
        <Pencil className="w-5 h-5" />
      </Link> */}
    </div>
  );
};

export default ProfileBanner;
