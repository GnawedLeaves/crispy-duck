import { ViewTransition } from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <ViewTransition>{children}</ViewTransition>;
};

export default Layout;
