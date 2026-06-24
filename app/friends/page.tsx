import { ViewTransition } from "react";
import FriendPanel from "./components/friendPanel";
import FriendFilterBar from "./components/friendFilterBar";
import { getFriendPanelData } from "../utils/supabase/friendAction";

const FriendPage = async () => {
  const initialUsers = await getFriendPanelData("all", "");
  return (
    <ViewTransition name="page-content">
      <div className="contentLayout">
        <div className="text-4xl text-center mb-4 font-bold">Friends</div>

        <FriendPanel initialUsers={initialUsers} />
      </div>
    </ViewTransition>
  );
};

export default FriendPage;
