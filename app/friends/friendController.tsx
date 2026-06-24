import { useEffect, useState } from "react";
import {
  getFriendPanelData,
  sendFriendRequest as sendFriendRequestAction,
  acceptFriendRequest as acceptFriendRequestAction,
  rejectFriendRequest as rejectFriendRequestAction,
  cancelFriendRequest as cancelFriendRequestAction,
} from "@/app/utils/supabase/friendAction";
import { FriendFilterType, FriendModel } from "../types/commonTypes";

const useFriendController = ({
  initialUsers,
}: {
  initialUsers: FriendModel[];
}) => {
  const [users, setUsers] = useState<FriendModel[]>(initialUsers);
  const [filter, setFilter] = useState<FriendFilterType>("Friends");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    getFriendPanelData(filter, debouncedSearch)
      .then((data) => active && setUsers(data ?? []))
      .finally(() => active && setIsLoading(false));
    return () => {
      active = false;
    };
  }, [filter, debouncedSearch]);

  const refetch = () =>
    getFriendPanelData(filter, debouncedSearch).then((data) =>
      setUsers(data ?? []),
    );

  const sendFriendRequest = async (id: string) => {
    const result = await sendFriendRequestAction(id);
    await refetch();
    return result;
  };
  const acceptFriendRequest = async (friendshipId: string) => {
    await acceptFriendRequestAction(friendshipId);
    refetch();
  };
  const rejectFriendRequest = async (friendshipId: string) => {
    await rejectFriendRequestAction(friendshipId);
    refetch();
  };
  const cancelFriendRequest = async (friendshipId: string) => {
    await cancelFriendRequestAction(friendshipId);
    refetch();
  };

  return {
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
  };
};

export default useFriendController;
