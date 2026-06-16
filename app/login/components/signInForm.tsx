"use client";

import { useState } from "react";
import { loginActionWithEmail } from "@/app/utils/login/authUtils";
import { useRouter } from "next/navigation";
import ButtonBar from "./buttonBar";
import { PageState } from "@/app/types/commonTypes";

interface LoginFormError {
  message: string;
  code?: string;
  status?: number;
}

interface SignInFormProps {
  setPageState: React.Dispatch<React.SetStateAction<PageState>>;
}

const SignInForm = ({ setPageState }: SignInFormProps) => {
  const [inputEmail, setInputEmail] = useState<string>("");
  const [inputPassword, setInputPassword] = useState<string>("");
  const [error, setError] = useState<LoginFormError | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const router = useRouter();

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError(null);

    const { data, error } = await loginActionWithEmail(
      inputEmail,
      inputPassword,
    );
    if (error) {
      setError(error);
      setSuccess(false);
    } else {
      setSuccess(true);
      setInputEmail("");
      setInputPassword("");
      router.push("/");
    }
  };
  return (
    <div className="contentLayout flexCenter flex-col">
      <ButtonBar
        prevButtonOnClick={() => {
          setPageState("landing");
        }}
      />

      <div className="text-5xl font-bold my-10 text-center"> Welcome Back!</div>
      <form onSubmit={handleSubmit}>
        <div className="flex gap-5 flex-col">
          <input
            className={"signUpFormField"}
            type="email"
            value={inputEmail}
            onChange={(e) => setInputEmail(e.target.value)}
            placeholder="Email"
          />
          <input
            className={"signUpFormField"}
            type="password"
            value={inputPassword}
            onChange={(e) => setInputPassword(e.target.value)}
            placeholder="Password"
          />
          {error && <div style={{ color: "red" }}>{error.message}</div>}
          {success && <div style={{ color: "green" }}>Log In successful!</div>}
          <button className="standardButton bg-amber-400!" type="submit">
            Log In
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignInForm;
