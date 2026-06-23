"use client";

import { FriendModel } from "@/app/types/commonTypes";
import Image from "next/image";
import maleDefaultAvatar from "../../assets/default_profile_pic_male.png";
import { token } from "@/app/theme";
import { Clock, Plus, UserRound } from "lucide-react";

interface FriendCardProps {
  friendModel: FriendModel;
  onViewProfileClick: (id: string) => void;
  onAddFriendClick: (id: string) => void;
}
const FriendCard = ({
  friendModel,
  onViewProfileClick,
  onAddFriendClick,
}: FriendCardProps) => {
  const renderSideButton = () => {
    if (friendModel.friendshipStatus === "accepted") {
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
    if (friendModel.friendshipStatus === "pending") {
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
        <div className="flexCenter">
          <Image
            src={maleDefaultAvatar}
            alt="avatar_image"
            className="object-cover rounded-full"
            width={60}
            height={60}
          />
        </div>

        <div className="flex flex-col justify-center gap-0.5">
          <div className="text-xl font-bold">{friendModel.display_name}</div>
          <div className="text-sm max-w-36 ">{"@" + friendModel.username}</div>
          <div className="text-xs max-w-40 opacity-50">
            {friendModel.bio ?? "-"}
          </div>
        </div>
      </div>
      <div className="flexCenter">{renderSideButton()}</div>
    </div>
  );
};

export default FriendCard;
