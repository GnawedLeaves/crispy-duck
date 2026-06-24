"use client";
import { FriendFilterType, FriendModel } from "@/app/types/commonTypes";
import React, { useMemo, useState } from "react";
import FriendCard from "./friendCard";
import { useRouter } from "next/navigation";
import { withDelay } from "@/app/utils/common";
import FriendPanelSearchBar from "./friendPanelSearchBar";
import FriendFilterBar from "./friendFilterBar";
import { useToast } from "@/app/components/toast/toastNotification";
import { token } from "@/app/theme";

const FriendPanel = () => {
  const mockFriends: FriendModel[] = [
    {
      id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      username: "fit_ninja",
      display_name: "Sarah Jenkins",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      bio: "Lifting heavy and eating carbs. 🏋️‍♀️",
      created_at: "2024-01-15T08:30:00Z",
      updated_at: "2026-06-20T12:00:00Z",
      birthday: "1992-04-12",
      sex: "F",
      friendshipStatus: "accepted",
    },
    {
      id: "c9bf9e57-1685-4c89-bafb-ff5af830be8a",
      username: "gym_bro_99",
      display_name: "Alex",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
      // bio is intentionally omitted to test optional chaining in your UI
      created_at: "2025-11-02T14:20:00Z",
      updated_at: "2026-06-21T09:15:00Z",
      birthday: "1999-08-25",
      sex: "M",
      friendshipStatus: "pending",
    },
    {
      id: "123e4567-e89b-12d3-a456-426614174000",
      username: "yoga.with.mia",
      display_name: "Mia T.",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mia",
      bio: "Finding balance every day. 🧘‍♀️",
      created_at: "2023-05-10T10:00:00Z",
      updated_at: "2026-06-18T16:45:00Z",
      birthday: "1988-11-03",
      sex: "F",
      friendshipStatus: "none",
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440000",
      username: "mysterious_lifter",
      display_name: "J. Doe",
      avatar_url: "https://api.dicebear.com/7.x/identicon/svg?seed=JDoe",
      bio: "Actions speak louder than words.",
      created_at: "2026-02-28T22:10:00Z",
      updated_at: "2026-06-23T07:30:00Z",
      birthday: "1995-01-01",
      sex: "NA",
      friendshipStatus: "accepted",
    },
    {
      id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      username: "newbie_gains",
      display_name: "Chris",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Chris",
      // bio and sex both omitted
      created_at: "2026-06-01T09:00:00Z",
      updated_at: "2026-06-05T10:00:00Z",
      birthday: "2001-05-15",
      friendshipStatus: "pending",
    },
    {
      id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      username: "fit_ninja",
      display_name: "Sarah Jenkins",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      bio: "Lifting heavy and eating carbs. 🏋️‍♀️",
      created_at: "2024-01-15T08:30:00Z",
      updated_at: "2026-06-20T12:00:00Z",
      birthday: "1992-04-12",
      sex: "F",
      friendshipStatus: "accepted",
    },
    {
      id: "c9bf9e57-1685-4c89-bafb-ff5af830be8a",
      username: "gym_bro_99",
      display_name: "Alex",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
      // bio is intentionally omitted to test optional chaining in your UI
      created_at: "2025-11-02T14:20:00Z",
      updated_at: "2026-06-21T09:15:00Z",
      birthday: "1999-08-25",
      sex: "M",
      friendshipStatus: "pending",
    },
    {
      id: "123e4567-e89b-12d3-a456-426614174000",
      username: "yoga.with.mia",
      display_name: "Mia T.",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mia",
      bio: "Finding balance every day. 🧘‍♀️",
      created_at: "2023-05-10T10:00:00Z",
      updated_at: "2026-06-18T16:45:00Z",
      birthday: "1988-11-03",
      sex: "F",
      friendshipStatus: "none",
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440000",
      username: "mysterious_lifter",
      display_name: "J. Doe",
      avatar_url: "https://api.dicebear.com/7.x/identicon/svg?seed=JDoe",
      bio: "Actions speak louder than words.",
      created_at: "2026-02-28T22:10:00Z",
      updated_at: "2026-06-23T07:30:00Z",
      birthday: "1995-01-01",
      sex: "NA",
      friendshipStatus: "accepted",
    },
    {
      id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      username: "newbie_gains",
      display_name: "Chris",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Chris",
      // bio and sex both omitted
      created_at: "2026-06-01T09:00:00Z",
      updated_at: "2026-06-05T10:00:00Z",
      birthday: "2001-05-15",
      friendshipStatus: "pending",
    },
  ];
  const filterButtons: FriendFilterType[] = [
    "All",
    "Friends",
    "Pending",
    "Strangers",
  ];
  const { triggerToast } = useToast();
  const [selectedFilter, setSelectedFilter] = useState<FriendFilterType>("All");
  const router = useRouter();
  const handleOnViewProfile = withDelay((userId: string) => {
    router.push(`/profile/view/${userId}`);
  });
  const handleAddFriend = (userId: string) => {};
  const handleOnFilterPress = (newFilter: FriendFilterType) => {
    setSelectedFilter(newFilter);
  };

  const filteredAndSortedFriendData = useMemo(() => {
    const sortedUsers = [...mockFriends].sort((a, b) =>
      a.display_name.localeCompare(b.display_name),
    );
    if (selectedFilter === "All") return sortedUsers;
    if (selectedFilter === "Friends") {
      return sortedUsers.filter(
        (friend) => friend.friendshipStatus === "accepted",
      );
    }
    if (selectedFilter === "Pending") {
      return sortedUsers.filter(
        (friend) => friend.friendshipStatus === "pending",
      );
    }
    if (selectedFilter === "Strangers") {
      return sortedUsers.filter((friend) => friend.friendshipStatus === "none");
    }
    return sortedUsers;
  }, [mockFriends, selectedFilter]);

  return (
    <div>
      <FriendFilterBar
        selected={selectedFilter}
        buttons={filterButtons}
        onFilterPress={handleOnFilterPress}
      />
      <button
        className="btn btn-primary"
        onClick={() =>
          triggerToast("Friend request sent!", token.light.primaryColor, 4000)
        }
      >
        Show Notification
      </button>
      <div
        className="cardWithShadow w-full h-[70vh] overflow-auto "
        style={{ padding: 0 }}
      >
        <FriendPanelSearchBar />
        <div>
          {filteredAndSortedFriendData.map((friend, index) => {
            return (
              <FriendCard
                key={index}
                friendModel={friend}
                onAddFriendClick={handleAddFriend}
                onViewProfileClick={handleOnViewProfile}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FriendPanel;
