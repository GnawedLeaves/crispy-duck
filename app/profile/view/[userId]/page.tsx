import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";
import Image from "next/image";
import React from "react";
import FriendContent from "../../components/friendContent";
import { getBodyScanDataFromFriend } from "@/app/utils/supabase/getBodyScanDataAction";
interface PageProps {
  params: Promise<{ userId: string }>;
}
const ViewProfilePage = async ({ params }: PageProps) => {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { userId } = await params;
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  const renderNonFriendContent = () => {
    return <div>Add this person as a friend to see their profile.</div>;
  };

  const renderFriendContent = () => {
    return (
      <FriendContent friendId={userId} friendTrendData={friendTrendData} />
    );
  };

  const friendTrendData = await getBodyScanDataFromFriend(userId);
  return (
    <div className="contentLayout">
      {/* ViewProfilePage for user: {userId} */}
      {!data && renderNonFriendContent()}
      {data && renderFriendContent()}
    </div>
  );
};

export default ViewProfilePage;
