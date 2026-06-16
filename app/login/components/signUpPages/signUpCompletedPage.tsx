"use client";
import { token } from "@/app/theme";
import { withDelay } from "@/app/utils/common";
import { startTransition } from "react";

interface SignUpCompletedPageProps {
  onContinueClick: () => void;
}

const SignUpCompletedPage = ({ onContinueClick }: SignUpCompletedPageProps) => {
  const handleOnCompleteClick = () => {
    withDelay(() => {
      startTransition(() => {
        onContinueClick();
      });
    })();
  };
  return (
    <div
      className="contentLayout flexCenter flex-col"
      style={{ background: token.light.primaryColor }}
    >
      <div className="flex gap-5 flex-col">
        <div className="text-5xl text-center">Success!</div>
        <div className="text-xl text-center">Your profile has been created</div>

        <button className="standardButton " onClick={handleOnCompleteClick}>
          Let's go
        </button>
      </div>
    </div>
  );
};

export default SignUpCompletedPage;
