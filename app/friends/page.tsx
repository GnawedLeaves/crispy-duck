import { ViewTransition } from "react";
import ProfileBanner from "../components/profile/profileBanner";

const FriendPage = () => {
  return (
    <ViewTransition name="page-content">
      <div className="contentLayout">
        <div>Friends go here</div>
      </div>
    </ViewTransition>
  );
};

export default FriendPage;
