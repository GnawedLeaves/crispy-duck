// app/actions/friends.ts
"use server";

import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";

export async function getFriendPanelData(
  filter: string,
  search: string,
  limit = 50,
  offset = 0,
) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: userData } = await supabase.auth.getUser();

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

  return data;
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
