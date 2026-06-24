"use client";
import { FriendFilterType, FriendModel } from "@/app/types/commonTypes";
import React, { useEffect, useMemo, useState, ViewTransition } from "react";
import FriendCard from "./friendCard";
import { useRouter } from "next/navigation";
import { withDelay } from "@/app/utils/common";
import FriendPanelSearchBar from "./friendPanelSearchBar";
import FriendFilterBar from "./friendFilterBar";
import { useToast } from "@/app/components/toast/toastNotification";
import { token } from "@/app/theme";
import useFriendController from "../friendController";
interface FriendPanelProps {
  initialUsers: any;
}
const FriendPanel = ({ initialUsers }: FriendPanelProps) => {
  const {
    users,
    isLoading,
    filter,
    setFilter,
    search,
    setSearch,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
  } = useFriendController({ initialUsers });

  useEffect(() => {
    console.log({ users });
  }, [users]);
  const filterButtons: FriendFilterType[] = [
    "All",
    "Friends",
    "Strangers",
    "Pending",
  ];
  const { triggerToast } = useToast();
  const router = useRouter();
  const handleOnViewProfile = withDelay((userId: string) => {
    router.push(`/profile/view/${userId}`);
  });
  const handleAddFriend = async (userId: string) => {
    try {
      await sendFriendRequest(userId);
      triggerToast("Friend request sent!", token.light.primaryColor, 4000);
    } catch (e) {
      triggerToast("Failed to send request", token.light.redColor, 4000);
      console.error(e);
    }
  };

  const handleAcceptFriendRequest = async (friendshipId: string) => {
    try {
      await acceptFriendRequest(friendshipId);
      triggerToast("Friend request accepted!", token.light.primaryColor, 4000);
    } catch (e) {
      triggerToast("Failed to accept request", token.light.redColor, 4000);
      console.error(e);
    }
  };

  const handleRejectFriendRequest = async (friendshipId: string) => {
    try {
      await rejectFriendRequest(friendshipId);
      triggerToast("Friend request rejected!", token.light.primaryColor, 4000);
    } catch (e) {
      triggerToast("Failed to reject request", token.light.redColor, 4000);
      console.error(e);
    }
  };
  const handleOnFilterPress = (newFilter: FriendFilterType) => {
    setFilter(newFilter);
  };

  const renderEmptyMessage = () => {
    if (users.length === 0 && !isLoading) {
      return (
        <div className="flexCenter min-h-[50vh]">
          {filter === "Strangers" && (
            <div>You're literally the only user lmao</div>
          )}
          {filter === "Pending" && (
            <div>Bruh you havent reached out to anyone...</div>
          )}
          {filter === "Friends" && <div>You aint got no friends yet...</div>}
        </div>
      );
    }
  };

  const renderLoading = () => {
    if (isLoading) {
      return (
        <div className="flexCenter min-h-[50vh]">
          <span className="loading loading-spinner loading-md" />
        </div>
      );
    }
  };
  return (
    <ViewTransition>
      <FriendFilterBar
        selected={filter}
        buttons={filterButtons}
        onFilterPress={handleOnFilterPress}
      />

      <div
        className="cardWithShadow w-full h-[70vh] overflow-auto "
        style={{ padding: 0 }}
      >
        <FriendPanelSearchBar search={search} setSearch={setSearch} />
        {renderLoading()}
        {renderEmptyMessage()}

        <div>
          {users.map((friend, index) => {
            return (
              <FriendCard
                key={index}
                friendModel={friend}
                onAddFriendClick={handleAddFriend}
                onViewProfileClick={handleOnViewProfile}
                onAcceptFriendClick={handleAcceptFriendRequest}
                onRejectFriendClick={handleRejectFriendRequest}
              />
            );
          })}
        </div>
      </div>
    </ViewTransition>
  );
};

export default FriendPanel;
