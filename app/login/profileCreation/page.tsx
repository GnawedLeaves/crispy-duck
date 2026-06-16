"use client";

import { useState, ViewTransition } from "react";
import ButtonBar from "../components/buttonBar";
import StepsBar from "../components/stepsBar";
import SignUpDisplayNamePage from "../components/signUpPages/signUpDisplayNamePage";
import SignUpBirthdayPage from "../components/signUpPages/signUpBirthdayPage";
import SignUpSexPage from "../components/signUpPages/signUpSexPage";
import SignUpCompletedPage from "../components/signUpPages/signUpCompletedPage";
import { useRouter } from "next/navigation";
const MAX_PAGE_NUM = 4;
const MIN_PAGE_NUM = 1;
const ProfileCreationPage = () => {
  const [profileCreationStateNum, setProfileCreationStateNum] =
    useState<number>(1);
  const [inputDisplayName, setInputDisplayName] = useState<string>("");
  const [inputBirthday, setInputBirthday] = useState<string>("");
  const [inputSex, setInputSex] = useState<string>("");
  const router = useRouter();

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

  const handleOnFinishClick = () => {};

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
        />
      );
    } else if (profileCreationStateNum === 4) {
      return <SignUpCompletedPage onContinueClick={handleOnCompletedClick} />;
    }
  };
  return (
    <ViewTransition>
      page: {profileCreationStateNum}
      {renderComponentBasedOnPageNum()}
      <ButtonBar
        showPrevButton={profileCreationStateNum !== 1}
        prevButtonOnClick={() => {
          handleDecreasePageNumber();
        }}
      />
      <StepsBar currentSegment={profileCreationStateNum} totalSegments={4} />
    </ViewTransition>
  );
};

export default ProfileCreationPage;
