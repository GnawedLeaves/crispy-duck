"use client";

import { token } from "@/app/theme";
interface FriendPanelSearchBarProps {}

const FriendPanelSearchBar = ({}: FriendPanelSearchBarProps) => {
  return (
    <div
      className="w-full sticky top-0 z-10 border-b flex align-middle p-4"
      style={{ background: token.light.background }}
    >
      <input
        type="text"
        placeholder={"Search for any user..."}
        className="border-2 rounded-full py-2 px-3 w-full"
        // onChange={}
      />
    </div>
  );
};

export default FriendPanelSearchBar;
