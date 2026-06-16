"use client";
import { PageState, SignUpPageState } from "@/app/types/commonTypes";
import { startTransition, useMemo, useState, ViewTransition } from "react";
import StepsBar from "./stepsBar";
import ButtonBar from "./buttonBar";
import { withDelay } from "@/app/utils/common";
import SignUpEmailPage from "./signUpPages/signUpEmailPage";

const MAX_PAGE_NUM = 6;
const MIN_PAGE_NUM = 1;

interface SignUpWizardProps {
  setPageState: React.Dispatch<React.SetStateAction<PageState>>;
}
const SignUpWizard = ({ setPageState }: SignUpWizardProps) => {
  const [signUpPageStateNum, setSignUpPageStateNum] = useState<number>(1);

  const getPageStateFromPageNumber = (inputNumber: number) => {
    switch (inputNumber) {
      case 0:
        return "landing";
      case 1:
        return "email";
      case 2:
        return "password";
      case 3:
        return "displayName";
      case 4:
        return "birthday";
      case 5:
        return "sex";
      case 6:
        return "completed";
      default:
        return 1;
    }
  };
  const handleIncreasePageNumber = () => {
    if (signUpPageStateNum + 1 <= MAX_PAGE_NUM) {
      setSignUpPageStateNum((prev) => prev + 1);
    }
  };

  const handleDecreasePageNumber = () => {
    if (signUpPageStateNum - 1 >= MIN_PAGE_NUM) {
      setSignUpPageStateNum((prev) => prev - 1);
    } else {
      handleNavigateBackToLandingPage();
    }
  };

  const handleNavigateBackToLandingPage = withDelay(() => {
    startTransition(() => {
      setPageState("landing");
      setSignUpPageStateNum(1);
    });
  });
  const renderComponentBasedOnPageNum = () => {
    if (signUpPageStateNum === 1) {
      return <SignUpEmailPage />;
    }
  };
  return (
    <ViewTransition>
      {/* Create Account Current Stage:{" "}
      {getPageStateFromPageNumber(signUpPageStateNum)} */}
      {renderComponentBasedOnPageNum()}
      <ButtonBar
        prevButtonOnClick={() => {
          handleDecreasePageNumber();
        }}
        // nextButtonOnClick={() => {
        //   handleIncreasePageNumber();
        // }}
      />
      <StepsBar currentSegment={signUpPageStateNum} totalSegments={6} />
    </ViewTransition>
  );
};

export default SignUpWizard;
