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
import { redirect, useRouter } from "next/navigation";
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
  const handleClickEditProfile = () => {
    setIsEditProfileModalOpen(true);
  };

  const handleCloseEditProfileModalClick = () => {
    setIsEditProfileModalOpen(false);
  };
  const handleClickSignOut = () => {
    setIsSignOutModalOpen(true);
  };
  const handleCloseSignOutModalClick = () => {
    setIsSignOutModalOpen(false);
  };

  const handleSignOut = withDelay(async () => {
    await signOutAction();
    await refreshUser();
    router.push("/login");
  });

  if (user && user.profile) {
    return (
      <div
        style={{
          display: "flex",
          padding: "1rem 0rem",
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
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <Link
            href="/profile"
            className="p-2 rounded-full inline-block transition-colors hover:opacity-80"
          >
            <Image
              src={user.profile.avatar_url}
              alt="avatar_image"
              width={60}
              height={60}
            />
          </Link>
          <div>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>
              {user?.profile?.display_name ?? "-"}
            </div>
            <div style={{ fontSize: "14px" }}>
              {user?.profile?.bio ?? "looking cripsy"}
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <div
            onClick={() => {
              handleClickEditProfile();
            }}
            className="p-2 rounded-full inline-block transition-colors hover:opacity-80"
            style={{ background: token.light.primaryColor }}
          >
            <Pencil className="w-5 h-5" />
          </div>
          <div
            className="p-2 rounded-full inline-block transition-colors opacity-80"
            style={{ background: token.light.redColor }}
            onClick={handleClickSignOut}
          >
            <LogOut className="w-5 h-5" />
          </div>
        </div>
      </div>
    );
  }
};

export default ProfileBanner;
