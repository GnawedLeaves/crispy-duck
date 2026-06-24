"use client";

import { token } from "@/app/theme";
import { PageState } from "@/app/types/commonTypes";
import { withDelay } from "@/app/utils/common";
import Link from "next/link";
import React, { startTransition } from "react";
import { SetStateAction } from "react";

interface LandingPageProps {
  setPageState: React.Dispatch<React.SetStateAction<PageState>>;
}
const LandingPage = ({ setPageState }: LandingPageProps) => {
  const handleLandingPageButtonClick = withDelay((nextStep: PageState) => {
    startTransition(() => {
      setPageState(nextStep);
    });
  });
  return (
    <div
      className="contentLayout flexCenter flex-col gap-8"
      style={{ background: token.light.orangeYellowColor }}
    >
      <div className="flex flex-col gap-1 w-full">
        <div className="text-2xl text-center w-full ">Welcome to</div>
        <div className="text-6xl text-center w-full font-bold">Crispy Duck</div>
      </div>

      <div className="flex gap-3">
        <button
          className="standardButton"
          style={{ background: token.light.blueColor }}
          onClick={() => {
            handleLandingPageButtonClick("login");
          }}
        >
          Log In
        </button>
        <button
          className="standardButton"
          onClick={() => {
            handleLandingPageButtonClick("signUp");
          }}
        >
          Create Account
        </button>
        {/* <Link href={`/login/signUpTest/${1}`}>View Profile</Link> */}
      </div>
    </div>
  );
};

export default LandingPage;
