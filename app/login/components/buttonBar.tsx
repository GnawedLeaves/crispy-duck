"use client";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { startTransition, addTransitionType } from "react";

interface ButtonBarProps {
  prevButtonOnClick: () => void;
  nextButtonOnClick?: () => void;
}
const ButtonBar = ({
  prevButtonOnClick,
  nextButtonOnClick,
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
  return (
    <div className="w-full flex justify-between fixed bottom-16 left-0 px-8 z-11">
      <button
        className="standardButton"
        onClick={(e) => {
          handleButtonClick(e, "backwards");
        }}
      >
        <ArrowLeft />
      </button>
      {nextButtonOnClick && (
        <button
          className="standardButton"
          onClick={(e) => {
            handleButtonClick(e, "forwards");
          }}
        >
          <ArrowRight />
        </button>
      )}
    </div>
  );
};
export default ButtonBar;
