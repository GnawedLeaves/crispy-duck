"use client";

import { token } from "@/app/theme";
import { FriendFilterType } from "@/app/types/commonTypes";

interface FriendFilterBarProps {
  buttons: FriendFilterType[];
  selected: FriendFilterType;
  onFilterPress: (newFilter: FriendFilterType) => void;
}
const FriendFilterBar = ({
  buttons,
  selected,
  onFilterPress,
}: FriendFilterBarProps) => {
  return (
    <div className="flex gap-2 my-4 w-full">
      {buttons.map((button, index) => (
        <button
          key={index}
          className={
            selected === button
              ? "standardButtonPressed text-xs"
              : "standardButton text-xs"
          }
          style={{
            width: 100,
            background:
              selected === button
                ? token.light.blueColor
                : token.light.background,
          }}
          onClick={() => {
            onFilterPress(button);
          }}
        >
          {button}
        </button>
      ))}
    </div>
  );
};

export default FriendFilterBar;
