"use client";
import { withDelay } from "@/app/utils/common";
import { startTransition } from "react";

interface SignUpDisplayNamePageProps {
  inputDisplayName: string;
  setInputDisplayName: React.Dispatch<React.SetStateAction<string>>;
  onContinueClick: () => void;
}

const SignUpDisplayNamePage = ({
  inputDisplayName,
  setInputDisplayName,
  onContinueClick,
}: SignUpDisplayNamePageProps) => {
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
          <div className="text-3xl">What would you like to be called?</div>
          <input
            className={`signUpFormField `}
            type="text"
            value={inputDisplayName}
            onChange={(e) => {
              setInputDisplayName(e.target.value);
            }}
            placeholder="Display Name"
            required
          />
          <button className="standardButton bg-amber-400!" type="submit">
            Continue
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignUpDisplayNamePage;
