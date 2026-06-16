"use client";
import { token } from "@/app/theme";
import { withDelay } from "@/app/utils/common";
import { startTransition } from "react";

interface SignUpSexPageProps {
  inputSex: string;
  setInputSex: React.Dispatch<React.SetStateAction<string>>;
  onContinueClick: () => void;
  isLoading: boolean;
  errorMessage: string | null;
}

const SignUpSexPage = ({
  inputSex,
  setInputSex,
  onContinueClick,
  isLoading,
  errorMessage,
}: SignUpSexPageProps) => {
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
          <div className="text-3xl">What were you born with?</div>
          <select
            className={`w-full ${"signUpFormField"}`}
            value={inputSex}
            onChange={(e) => setInputSex(e.target.value)}
            required
          >
            <option value="" disabled>
              Select Sex
            </option>
            <option value="M">Male</option>
            <option value="F">Female</option>
            <option value="O">Other</option>
          </select>
          {errorMessage && (
            <p className="text-red-500 text-sm text-center">{errorMessage}</p>
          )}

          <button
            className="standardButton "
            style={{ background: token.light.blueColor }}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex gap-3 align-center justify-center">
                <span className="loading loading-spinner"></span>
                Creating profile...
              </div>
            ) : (
              "Finish"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignUpSexPage;
