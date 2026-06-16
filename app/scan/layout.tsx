import { ViewTransition } from "react";
import ProfileBanner from "../components/profile/profileBanner";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <ProfileBanner />
      <ViewTransition>{children}</ViewTransition>
    </div>
  );
};

export default Layout;
