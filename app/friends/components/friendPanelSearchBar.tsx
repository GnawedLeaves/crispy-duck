"use client";

import { token } from "@/app/theme";
import { X } from "lucide-react";
interface FriendPanelSearchBarProps {
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
}

const FriendPanelSearchBar = ({
  search,
  setSearch,
}: FriendPanelSearchBarProps) => {
  return (
    <div
      className="w-full sticky top-0 z-10 border-b flex align-middle p-4"
      style={{ background: token.light.background }}
    >
      <input
        type="text"
        placeholder={"Search for duck..."}
        className="border-2 rounded-full py-2 px-3 w-full"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
        }}
      />
      {search.length != 0 && (
        <div
          className="absolute right-8 top-7"
          onClick={() => {
            setSearch("");
          }}
        >
          <X className="w-5 h-5" />
        </div>
      )}
    </div>
  );
};

export default FriendPanelSearchBar;
