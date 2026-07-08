// app/actions/friends.ts
"use server";

import { FriendPanelRow, FriendModel } from "@/app/types/commonTypes";
import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";

function mapToFriendModel(row: FriendPanelRow): FriendModel {
  return {
    id: row.id,
    username: row.username,
    display_name: row.display_name,
    avatar_url: row.avatar_url,
    bio: undefined,
    created_at: undefined as unknown as string,
    updated_at: undefined as unknown as string,
    birthday: undefined as unknown as string,
    sex: row.sex,
    friendshipModel: {
      friendshipStatus: row.friendship_status,
      friendshipId: row.friendship_id ?? "",
      friendshipRequesterId: row.friendship_requester_id ?? "",
      friendshipAddresseeId: row.friendship_addressee_id ?? "",
    },
  };
}

export async function getFriendPanelData(
  filter: string,
  search: string,
  limit = 50,
  offset = 0,
): Promise<FriendModel[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.rpc("get_friend_panel", {
    p_filter: filter.toLowerCase(),
    p_search: search || null,
    p_limit: limit,
    p_offset: offset,
  });

  if (error) {
    console.error("RPC Error:", error);
    throw error;
  }

  return (data ?? []).map(mapToFriendModel);
}
export async function sendFriendRequest(addresseeId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("friendships").insert({
    requester_id: user.id,
    addressee_id: addresseeId,
    status: "pending",
  });
  if (error) throw error;
}

export async function acceptFriendRequest(friendshipId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { error } = await supabase
    .from("friendships")
    .update({ status: "accepted" })
    .eq("id", friendshipId);
  if (error) throw error;
}

// reject (you decline an incoming request) and cancel (you withdraw
// your own outgoing request) are the same DB operation — delete the
// pending row. Kept as two functions since they're called from
// different UI contexts / actors, but feel free to collapse them.
export async function rejectFriendRequest(friendshipId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { error } = await supabase
    .from("friendships")
    .delete()
    .eq("id", friendshipId);
  if (error) throw error;
}

export async function cancelFriendRequest(friendshipId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { error } = await supabase
    .from("friendships")
    .delete()
    .eq("id", friendshipId);
  if (error) throw error;
}

// in friendAction.ts
export async function getFriendProfile(friendId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("profiles_public")
    .select("id, username, display_name, avatar_url, sex, birthday, created_at")
    .eq("id", friendId)
    .maybeSingle();

  if (error) throw error;
  console.log({ data });
  return data;
}
