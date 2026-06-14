import ProfileBanner from "../components/profile/profileBanner";
import CurrentStatsComponent from "./components/currentStats/currentStats";

const page = async () => {
  return (
    <div className="contentLayout">
      <ProfileBanner />
      <CurrentStatsComponent />
    </div>
  );
};

export default page;
