"use client";

import { token } from "@/app/theme";
import { TremorColorItem, TremorLineGraphColor } from "@/app/types/commonTypes";
import { useState } from "react";

interface ColorSelectionComponentProps {
  selectedColor: TremorLineGraphColor;
  onColorSelect: (newColor: TremorLineGraphColor) => void;
  onCancelClick: () => void;
  onSaveClick: () => void;
  isLoading: boolean;
}

const ColorSelectionComponent = ({
  selectedColor = "amber",
  onColorSelect,
  onCancelClick,
  onSaveClick,
  isLoading,
}: ColorSelectionComponentProps) => {
  //   const [selectedColor, setSelectedColor] =
  //     useState<TremorLineGraphColor>(initialColor);

  const handleOnColorPress = (colorName: TremorLineGraphColor) => {
    // setSelectedColor(colorName);
    onColorSelect(selectedColor);
  };

  const handleOnSaveClick = () => {
    onSaveClick();
  };

  const handleOnCancelClick = () => {
    onCancelClick();
  };

  return (
    <div className="cardWithShadow my-4">
      <div className="mb-4">
        <div className="text-xl font-bold">Choose graph line colour</div>
        <div className="text-sm">
          Scroll down to preview, affects compare mode too.
        </div>
      </div>
      <div className="flex gap-3 flex-wrap justify-center">
        {tremorHexColors.map(({ name, hexCode }, index) => {
          return (
            <button
              onClick={() => {
                onColorSelect(name);
              }}
              key={name}
              className={
                selectedColor === name
                  ? "standardButtonPressed"
                  : "standardButton"
              }
              style={{ background: hexCode, width: 90, height: 40 }}
            >
              {name.charAt(0).toLocaleUpperCase() + name.slice(1, name.length)}
            </button>
          );
        })}
      </div>
      <div className="w-full flex gap-2 mt-4 justify-end">
        <button
          className="standardButton"
          style={{ background: token.light.primaryColor }}
          onClick={handleOnSaveClick}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="loading loading-spinner loading-md"></span>
          ) : (
            "Save"
          )}
        </button>
        <button
          className="standardButton"
          onClick={handleOnCancelClick}
          disabled={isLoading}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ColorSelectionComponent;
export const tremorHexColors: TremorColorItem[] = [
  // Neutral & Grayscale
  { name: "gray", hexCode: "#6b7280" },
  //   { name: "neutral", hexCode: "#737373" },
  //   { name: "stone", hexCode: "#78716c" },

  // Warm Tones
  //   { name: "red", hexCode: "#ef4444" },
  //   { name: "orange", hexCode: "#f97316" },
  { name: "amber", hexCode: "#f59e0b" },
  //   { name: "yellow", hexCode: "#eab308" },

  // Cool & Vibrant Tones
  { name: "lime", hexCode: "#84cc16" },
  //   { name: "green", hexCode: "#22c55e" },
  { name: "emerald", hexCode: "#10b981" },
  //   { name: "teal", hexCode: "#14b8a6" },
  { name: "cyan", hexCode: "#06b6d4" },
  //   { name: "sky", hexCode: "#0ea5e9" },
  { name: "blue", hexCode: "#3b82f6" },
  //   { name: "indigo", hexCode: "#6366f1" },
  { name: "violet", hexCode: "#8b5cf6" },
  //   { name: "purple", hexCode: "#a855f7" },
  { name: "fuchsia", hexCode: "#d946ef" },
  { name: "pink", hexCode: "#ec4899" },
  //   { name: "rose", hexCode: "#f43f5e" },
];
