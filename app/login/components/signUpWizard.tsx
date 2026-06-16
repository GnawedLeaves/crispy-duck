"use client";
import { PageState } from "@/app/types/commonTypes";
import { startTransition, useState, ViewTransition } from "react";
import ButtonBar from "./buttonBar";
import { withDelay } from "@/app/utils/common";
import SignUpEmailPage from "./signUpPages/signUpEmailPage";
import { useRouter } from "next/navigation";

interface SignUpWizardProps {
  setPageState: React.Dispatch<React.SetStateAction<PageState>>;
}
const SignUpWizard = ({ setPageState }: SignUpWizardProps) => {
  const [signUpPageStateNum, setSignUpPageStateNum] = useState<number>(1);
  const router = useRouter();

  const handleNavigateBackToLandingPage = withDelay(() => {
    startTransition(() => {
      setPageState("landing");
      setSignUpPageStateNum(1);
    });
  });

  const handleUserCreationSuccess = withDelay(() => {
    router.push("/login/profileCreation");
  });

  const renderComponentBasedOnPageNum = () => {
    if (signUpPageStateNum === 1) {
      return <SignUpEmailPage onSuccess={handleUserCreationSuccess} />;
    }
  };

  return (
    <ViewTransition>
      {renderComponentBasedOnPageNum()}
      <ButtonBar prevButtonOnClick={handleNavigateBackToLandingPage} />
    </ViewTransition>
  );
};

export default SignUpWizard;
