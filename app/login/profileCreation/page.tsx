"use client";

import { useState, ViewTransition } from "react";
import ButtonBar from "../components/buttonBar";
import StepsBar from "../components/stepsBar";
import SignUpDisplayNamePage from "../components/signUpPages/signUpDisplayNamePage";
import SignUpBirthdayPage from "../components/signUpPages/signUpBirthdayPage";
import SignUpSexPage from "../components/signUpPages/signUpSexPage";
import SignUpCompletedPage from "../components/signUpPages/signUpCompletedPage";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { createProfileAction } from "@/app/utils/login/authUtils";
const MAX_PAGE_NUM = 4;
const MIN_PAGE_NUM = 1;
const ProfileCreationPage = () => {
  const [profileCreationStateNum, setProfileCreationStateNum] =
    useState<number>(MIN_PAGE_NUM);
  const [inputDisplayName, setInputDisplayName] = useState<string>("");
  const [inputBirthday, setInputBirthday] = useState<string>("");
  const [inputSex, setInputSex] = useState<string>("");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleIncreasePageNumber = () => {
    if (profileCreationStateNum + 1 > MAX_PAGE_NUM) {
      setProfileCreationStateNum(MAX_PAGE_NUM);
    } else {
      setProfileCreationStateNum((prev) => prev + 1);
    }
  };

  const handleDecreasePageNumber = () => {
    if (profileCreationStateNum - 1 <= MIN_PAGE_NUM) {
      setProfileCreationStateNum(MIN_PAGE_NUM);
    } else {
      setProfileCreationStateNum((prev) => prev - 1);
    }
  };

  const handleOnContinueClick = () => {
    handleIncreasePageNumber();
  };

  const handleOnFinishClick = async () => {
    setIsLoading(true);
    setSubmitError(null);

    const { data, error } = await createProfileAction({
      display_name: inputDisplayName,
      birthday: inputBirthday,
      sex: inputSex,
    });

    setIsLoading(false);

    if (error) {
      const msg = error.message?.toLowerCase() ?? "";
      if (msg.includes("duplicate") || msg.includes("already exists")) {
        setSubmitError("A profile already exists for this account.");
      } else {
        setSubmitError("Something went wrong. Please try again.");
      }
      return;
    }

    handleIncreasePageNumber();
  };

  const handleOnCompletedClick = () => {
    router.push("/");
  };
  const renderComponentBasedOnPageNum = () => {
    if (profileCreationStateNum === 1) {
      return (
        <SignUpDisplayNamePage
          inputDisplayName={inputDisplayName}
          setInputDisplayName={setInputDisplayName}
          onContinueClick={handleOnContinueClick}
        />
      );
    } else if (profileCreationStateNum === 2) {
      return (
        <SignUpBirthdayPage
          inputBirthday={inputBirthday}
          setInputBirthday={setInputBirthday}
          onContinueClick={handleOnContinueClick}
        />
      );
    } else if (profileCreationStateNum === 3) {
      return (
        <SignUpSexPage
          inputSex={inputSex}
          setInputSex={setInputSex}
          onContinueClick={handleOnFinishClick}
          isLoading={isLoading}
          errorMessage={submitError}
        />
      );
    } else if (profileCreationStateNum === 4) {
      return <SignUpCompletedPage onContinueClick={handleOnCompletedClick} />;
    }
  };
  return (
    <ViewTransition>
      {renderComponentBasedOnPageNum()}
      <ButtonBar
        showPrevButton={
          profileCreationStateNum !== MIN_PAGE_NUM &&
          profileCreationStateNum !== MAX_PAGE_NUM &&
          !isLoading
        }
        prevButtonOnClick={() => {
          handleDecreasePageNumber();
        }}
      />
      <StepsBar currentSegment={profileCreationStateNum} totalSegments={4} />
    </ViewTransition>
  );
};

export default ProfileCreationPage;
