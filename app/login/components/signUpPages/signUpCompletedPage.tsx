"use client";
import { withDelay } from "@/app/utils/common";
import { startTransition } from "react";

interface SignUpCompletedPageProps {
  onContinueClick: () => void;
}

const SignUpCompletedPage = ({ onContinueClick }: SignUpCompletedPageProps) => {
  const handleOnDisplayNameSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    withDelay(() => {
      startTransition(() => {
        onContinueClick();
      });
    })();
  };
  return (
    <div className="contentLayout flexCenter flex-col">
      <form onSubmit={handleOnDisplayNameSubmit}>
        <div className="flex gap-5 flex-col">
          <div className="text-3xl">Your profile has been created</div>

          <button className="standardButton bg-amber-400!" type="submit">
            Let's go!
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignUpCompletedPage;
