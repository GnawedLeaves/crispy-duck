"use client";

import { FriendModel } from "@/app/types/commonTypes";
import Image from "next/image";

import { token } from "@/app/theme";
import { Check, Clock, Pencil, Plus, UserRound, X } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { useMemo } from "react";
import { handleEmptyProfilePic } from "@/app/utils/common";

interface FriendCardProps {
  friendModel: FriendModel;
  onViewProfileClick: (id: string) => void;
  onAddFriendClick: (id: string) => void;
  onAcceptFriendClick: (id: string) => void;
  onRejectFriendClick: (id: string) => void;
}
const FriendCard = ({
  friendModel,
  onViewProfileClick,
  onAddFriendClick,
  onAcceptFriendClick,
  onRejectFriendClick,
}: FriendCardProps) => {
  const { user, refreshUser, isLoading } = useAuth();

  const renderSideButton = () => {
    if (friendModel.friendshipModel.friendshipStatus === "accepted") {
      return (
        <button
          className="standardButton"
          onClick={() => {
            onViewProfileClick(friendModel.id);
          }}
        >
          <UserRound className="w-5 h-5" />
        </button>
      );
    }
    if (friendModel.friendshipModel.friendshipStatus === "pending") {
      if (user?.id === friendModel.friendshipModel.friendshipAddresseeId) {
        return (
          <div className="flex gap-2 shrink-0">
            <div
              onClick={() => {
                onRejectFriendClick(friendModel.friendshipModel.friendshipId);
              }}
              className="p-2 rounded-full inline-block transition-colors hover:opacity-80 standardButton "
              style={{ background: token.light.redColor }}
            >
              <X className="w-5 h-5" />
            </div>
            <div
              onClick={() => {
                onAcceptFriendClick(friendModel.friendshipModel.friendshipId);
              }}
              style={{ background: token.light.greenColor }}
              className="p-2 rounded-full inline-block transition-colors hover:opacity-80 standardButton"
            >
              <Check className="w-5 h-5" />
            </div>
          </div>
        );
      }

      return (
        <div>
          <Clock />
        </div>
      );
    }
    return (
      <div
        onClick={() => {
          onAddFriendClick(friendModel.id);
        }}
        // className="p-2 rounded-full inline-block transition-colors hover:opacity-80 standardShadow border-2"
        className="standardButton"
        style={{
          background: token.light.primaryColor,
          borderColor: token.light.borderColor,
        }}
      >
        <Plus className="w-5 h-5" />
      </div>
    );
  };
  return (
    <div
      className="flex w-full border-b py-2 px-4 justify-between h-28"
      style={{ borderColor: token.light.borderColor }}
    >
      <div className="flex gap-2 h-full ">
        <div className="flexCenter shrink-0">
          <Image
            src={handleEmptyProfilePic(friendModel.sex, friendModel.avatar_url)}
            alt="avatar_image"
            className="object-cover rounded-full aspect-square border-2 border-black"
            width={60}
            height={60}
          />
        </div>

        <div className="flex flex-col justify-center gap-0.5">
          <div className="text-xl font-bold">{friendModel.display_name}</div>
          <div className="text-sm max-w-36 ">{"@" + friendModel.username}</div>
          <div className="text-xs max-w-40 opacity-50">{friendModel.bio}</div>
        </div>
      </div>
      <div className="flexCenter">{renderSideButton()}</div>
    </div>
  );
};

export default FriendCard;
