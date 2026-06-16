"use client";

import { useAuth } from "@/app/context/AuthContext";
import { signUpAction } from "@/app/utils/login/authUtils";
import { useState } from "react";

const SignUpEmailPage = () => {
  const { refreshUser } = useAuth();

  const [inputEmail, setInputEmail] = useState<string>("");
  const [inputPassword, setInputPassword] = useState<string>("");
  const [inputConfirmPassword, setInputConfirmPassword] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };
  return (
    <div className="contentLayout flexCenter flex-col ">
      <form onSubmit={handleSubmit}>
        <div className="text-4xl font-bold my-10 text-center">
          Create New Account
        </div>
        <div className="flex gap-5 flex-col">
          <input
            className={"signUpFormField"}
            type="email"
            value={inputEmail}
            onChange={(e) => setInputEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <input
            className={"signUpFormField"}
            type="password"
            value={inputPassword}
            onChange={(e) => setInputPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <input
            className={"signUpFormField"}
            type="password"
            value={inputPassword}
            onChange={(e) => setInputPassword(e.target.value)}
            placeholder="Confirm Password"
            required
          />
          <button
            disabled
            className="standardButton bg-amber-400!"
            type="submit"
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignUpEmailPage;
