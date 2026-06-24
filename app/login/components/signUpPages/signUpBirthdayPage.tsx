"use client";
import { BirthdayPicker } from "@/app/components/birthdayPicker/BirthdayPicker";
import { token } from "@/app/theme";
import { withDelay } from "@/app/utils/common";
import { startTransition } from "react";

interface SignUpBirthdayPageProps {
  inputBirthday: string;
  setInputBirthday: React.Dispatch<React.SetStateAction<string>>;
  onContinueClick: () => void;
}

const SignUpBirthdayPage = ({
  inputBirthday,
  setInputBirthday,
  onContinueClick,
}: SignUpBirthdayPageProps) => {
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
          <div className="text-3xl">When did you exit the womb?</div>
          <div className="">
            <BirthdayPicker
              value={inputBirthday}
              onChange={(dateString) => setInputBirthday(dateString)}
              className={"signUpFormField h-fit "}
            />
          </div>

          <button
            className="standardButton "
            type="submit"
            style={{ background: token.light.primaryColor }}
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignUpBirthdayPage;
