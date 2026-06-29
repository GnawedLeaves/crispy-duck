import Backbar from "@/app/components/backbar/Backbar";
import ProfileBanner from "@/app/components/profile/profileBanner";
import { ViewTransition } from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <Backbar />
      <ViewTransition>{children}</ViewTransition>
    </div>
  );
};

export default Layout;
