"use client";
import { token } from "@/app/theme";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { startTransition, addTransitionType } from "react";

interface ButtonBarProps {
  prevButtonOnClick: () => void;
  nextButtonOnClick?: () => void;
  showWholebar?: boolean;
  showPrevButton?: boolean;
}
const ButtonBar = ({
  prevButtonOnClick,
  nextButtonOnClick,
  showWholebar = true,
  showPrevButton = true,
}: ButtonBarProps) => {
  const handleButtonClick = (event: any, direction: string) => {
    event.preventDefault();
    startTransition(() => {
      addTransitionType(direction);
      if (direction === "forwards" && nextButtonOnClick) {
        nextButtonOnClick();
      } else {
        prevButtonOnClick();
      }
    });
  };

  if (showWholebar) {
    return (
      <div className="w-full flex justify-between fixed bottom-16 left-0 px-8 z-11">
        {showPrevButton ? (
          <button
            className="standardButton"
            onClick={(e) => {
              handleButtonClick(e, "backwards");
            }}
          >
            <ArrowLeft />
          </button>
        ) : (
          <div></div>
        )}

        {nextButtonOnClick && (
          <button
            className="standardButton"
            style={{ background: token.light.primaryColor }}
            onClick={(e) => {
              handleButtonClick(e, "forwards");
            }}
          >
            <ArrowRight />
          </button>
        )}
      </div>
    );
  }
  return <></>;
};
export default ButtonBar;
