"use client";
import { useAuth } from "@/app/context/AuthContext";
import { token } from "@/app/theme";
import { LogOut, Pencil } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import EditProfileModal from "./editProfileModal";
import { withDelay } from "@/app/utils/common";
import { signOutAction } from "@/app/utils/login/authUtils";
import { useRouter } from "next/navigation";
import CustomModal from "../modal/customModal";

const ProfileBanner = () => {
  const { user, refreshUser, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && !user.profile) {
      router.push("/login/profileCreation");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    refreshUser();
  }, []);

  const [isEditProfileModalOpen, setIsEditProfileModalOpen] =
    useState<boolean>(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState<boolean>(false);

  const handleClickEditProfile = () => setIsEditProfileModalOpen(true);
  const handleCloseEditProfileModalClick = () =>
    setIsEditProfileModalOpen(false);
  const handleClickSignOut = () => setIsSignOutModalOpen(true);
  const handleCloseSignOutModalClick = () => setIsSignOutModalOpen(false);

  const handleSignOut = withDelay(async () => {
    await signOutAction();
    await refreshUser();
    router.push("/login");
  });

  if (!isLoading && (!user || !user.profile)) {
    return null;
  }

  const ProfileBannerSkeleton = () => (
    <div
      style={
        {
          display: "flex",
          padding: "2rem 2rem 0 2rem",
          alignItems: "center",
          justifyContent: "space-between",
          "--color-base-300": "#D4C9C1",
        } as React.CSSProperties
      }
    >
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <div className="skeleton w-15 h-15 rounded-full shrink-0" />
        <div className="flex flex-col gap-2">
          <div className="skeleton h-6 w-32" />
          <div className="skeleton h-4 w-44" />
        </div>
      </div>

      <div className="gap-2" style={{ display: "flex" }}>
        <div className="skeleton w-9 h-9 rounded-full" />
        <div className="skeleton w-9 h-9 rounded-full" />
      </div>
    </div>
  );

  return isLoading ? (
    <ProfileBannerSkeleton />
  ) : (
    <div
      style={{
        display: "flex",
        padding: "2rem 2rem 0 2rem",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <CustomModal
        actionButtonText="Confirm"
        title="Confirm Sign Out"
        isOpen={isSignOutModalOpen}
        onClose={handleCloseSignOutModalClick}
        modalType="action"
        onActionClick={handleSignOut}
      >
        <div>Are you sure you want to sign out?</div>
      </CustomModal>

      <EditProfileModal
        isOpen={isEditProfileModalOpen}
        existingUser={user}
        onClose={handleCloseEditProfileModalClick}
      />

      <div className="flex gap-1 items-center">
        <Link
          href="/profile"
          className="p-2 rounded-full inline-block transition-colors hover:opacity-80"
        >
          <Image
            width={100}
            height={100}
            src={user?.profile?.avatar_url ?? "/default-avatar.png"}
            alt="avatar_image"
            className="rounded-full object-cover w-18 h-18 border-2 border-black"
          />
        </Link>
        <div>
          <div className="text-2xl font-bold">
            {user?.profile?.display_name ?? "Loading..."}
          </div>
          <div className="text-sm ">{"@" + user?.profile?.username}</div>
        </div>
      </div>

      <div className="gap-2" style={{ display: isLoading ? "none" : "flex" }}>
        <div
          onClick={handleClickEditProfile}
          className="standardButton flexCenter"
          style={{
            borderRadius: "50%",
            width: "2.5rem",
            height: "2.5rem",
            padding: 0,
          }}
        >
          <Pencil className="w-5 h-5" />
        </div>
        <div
          className="standardButton flexCenter"
          style={{
            borderRadius: "50%",
            width: "2.5rem",
            height: "2.5rem",
            padding: 0,
          }}
          onClick={handleClickSignOut}
        >
          <LogOut className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

export default ProfileBanner;
