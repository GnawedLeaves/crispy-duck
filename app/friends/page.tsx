import { ViewTransition } from "react";
import FriendPanel from "./components/friendPanel";
import FriendFilterBar from "./components/friendFilterBar";

const FriendPage = () => {
  return (
    <ViewTransition name="page-content">
      <div className="contentLayout">
        <div className="text-4xl text-center mb-4 font-bold">Friends</div>

        <FriendPanel />
      </div>
    </ViewTransition>
  );
};

export default FriendPage;
