"use client";
import dayjs from "dayjs";
import { useAuth } from "@/app/context/AuthContext";
import { withDelay } from "@/app/utils/common";
import { signUpAction, signUpAsGuestAction } from "@/app/utils/login/authUtils";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./styles.module.css";
import { BirthdayPicker } from "@/app/components/birthdayPicker/BirthdayPicker";
import { token } from "@/app/theme";

interface LoginFormError {
  message: string;
  code?: string;
  status?: number;
}

const SignUpForm = () => {
  const [inputEmail, setInputEmail] = useState<string>("");
  const [inputDisplayName, setDisplayName] = useState<string>("");
  const [inputPassword, setInputPassword] = useState<string>("");
  const [inputSex, setInputSex] = useState<string>("");
  const [inputBirthday, setInputBirthday] = useState<string>("");

  const [error, setError] = useState<LoginFormError | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const router = useRouter();
  const { refreshUser } = useAuth();

  // Changed React.SubmitEvent to React.FormEvent<HTMLFormElement>
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (inputDisplayName === "") {
      setError({ message: "User name cannot be blank" });
      return;
    }

    const { data, error } = await signUpAction({
      email: inputEmail,
      password: inputPassword,
      display_name: inputDisplayName,
      birthday: inputBirthday,
      sex: inputSex,
    });

    if (error) {
      setError(error);
      setSuccess(false);
    } else {
      setSuccess(true);
      setInputEmail("");
      setInputPassword("");
      setInputSex("");
      setInputBirthday("");
      await refreshUser();
      router.push("/");
    }
  };

  const handleGuestSignUp = withDelay(async () => {
    const { data, error } = await signUpAsGuestAction();
    if (error) {
      setError(error);
    } else {
      setSuccess(true);
      await refreshUser();
      router.push("/");
    }
  });

  return (
    <div>
      Sign up
      <form onSubmit={handleSubmit}>
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
            type="text"
            value={inputDisplayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="User name"
            required
            maxLength={30}
          />
          <input
            className={"signUpFormField"}
            type="password"
            value={inputPassword}
            onChange={(e) => setInputPassword(e.target.value)}
            placeholder="Password"
            required
          />
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
          <BirthdayPicker
            value={inputBirthday}
            onChange={(dateString) => setInputBirthday(dateString)}
            className={"signUpFormField"}
          />
          {error && <div style={{ color: "red" }}>{error.message}</div>}
          {success && <div style={{ color: "green" }}>Sign up successful!</div>}
          <button
            className="standardButton "
            type="submit"
            style={{ background: token.light.primaryColor }}
          >
            Sign Up
          </button>
          <button
            className="standardButton "
            style={{ background: token.light.primaryColor }}
            type="button"
            onClick={handleGuestSignUp}
          >
            Continue as guest
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignUpForm;
