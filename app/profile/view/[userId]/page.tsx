import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";
import React from "react";
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

  if (!data) {
    return <>Add non friend preview here</>; // "Add as friend to view this profile"
  }

  const renderNonFriendContent = () => {
    return <div>Add this person as a friend to see their profile.</div>;
  };
  return (
    <div className="contentLayout">
      ViewProfilePage for user: {userId}
      {!data && renderNonFriendContent()}
    </div>
  );
};

export default ViewProfilePage;
