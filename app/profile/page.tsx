"use client";

import Image from "next/image";
import { useAuth } from "../context/AuthContext";
import SignOutForm from "../login/components/signOutForm";

const ProfilePage = () => {
  const { user, refreshUser } = useAuth();

  console.log({ user });
  return (
    <div className="contentLayout">
      {user && user.profile && (
        <div className="flexCenter flex-col">
          <Image
            src={user?.profile?.avatar_url}
            alt="profile_picture"
            width={100}
            height={100}
          />
          <div>Display Name: {user.profile.display_name}</div>
          <div>Sex: {user.profile.sex}</div>
          <div>Bio: {user.profile.bio}</div>
        </div>
      )}
      <SignOutForm />
    </div>
  );
};

export default ProfilePage;
