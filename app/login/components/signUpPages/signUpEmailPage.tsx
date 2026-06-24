"use client";

import { useAuth } from "@/app/context/AuthContext";
import { token } from "@/app/theme";
import { createAccountAction } from "@/app/utils/login/authUtils";
import { useState } from "react";

interface SignUpEmailPageProps {
  onSuccess: () => void; // called by wizard to advance to next page
}

const SignUpEmailPage = ({ onSuccess }: SignUpEmailPageProps) => {
  const { refreshUser } = useAuth();

  const [inputEmail, setInputEmail] = useState<string>("");
  const [inputPassword, setInputPassword] = useState<string>("");
  const [inputConfirmPassword, setInputConfirmPassword] = useState<string>("");

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    form?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  // --- inline validation helpers ---
  const validateEmail = (value: string) => {
    if (!value) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      return "Enter a valid email address.";
    return undefined;
  };

  const validatePassword = (value: string) => {
    if (!value) return "Password is required.";
    if (value.length < 8) return "Password must be at least 8 characters.";
    if (!/[A-Z]/.test(value)) return "Include at least one uppercase letter.";
    if (!/[0-9]/.test(value)) return "Include at least one number.";
    return undefined;
  };

  const validateConfirmPassword = (value: string) => {
    if (!value) return "Please confirm your password.";
    if (value !== inputPassword) return "Passwords don't match.";
    return undefined;
  };

  const validateAll = () => {
    const next = {
      email: validateEmail(inputEmail),
      password: validatePassword(inputPassword),
      confirmPassword: validateConfirmPassword(inputConfirmPassword),
    };
    setErrors(next);
    return !next.email && !next.password && !next.confirmPassword;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateAll()) return;

    setIsLoading(true);
    setErrors({});

    const result = await createAccountAction({
      email: inputEmail,
      password: inputPassword,
    });

    setIsLoading(false);

    if (result.error) {
      // Map Supabase error messages to user-friendly copy
      const msg = result.error.message?.toLowerCase() ?? "";
      if (
        msg.includes("already registered") ||
        msg.includes("already exists") ||
        msg.includes("user already")
      ) {
        setErrors({
          email:
            "An account with this email already exists. Try logging in instead.",
        });
      } else if (msg.includes("invalid email")) {
        setErrors({ email: "This email address doesn't look right." });
      } else if (msg.includes("password")) {
        setErrors({ password: result.error.message });
      } else {
        setErrors({ form: "Something went wrong. Please try again." });
      }
      return;
    }

    await refreshUser();
    onSuccess();
  };

  const isFormComplete = inputEmail && inputPassword && inputConfirmPassword;

  return (
    <div className="contentLayout flexCenter flex-col">
      <form onSubmit={handleSubmit} noValidate>
        <div className="text-4xl font-bold my-10 text-center">
          Create New Account
        </div>

        <div className="flex gap-5 flex-col">
          {/* Email */}
          <div className="flex flex-col gap-1">
            <input
              className={`signUpFormField ${errors.email ? "border-red-500" : ""}`}
              type="email"
              value={inputEmail}
              onChange={(e) => {
                setInputEmail(e.target.value);
                if (errors.email)
                  setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              onBlur={() =>
                setErrors((prev) => ({
                  ...prev,
                  email: validateEmail(inputEmail),
                }))
              }
              placeholder="Email"
              autoComplete="email"
              required
            />
            {errors.email && (
              <p className="text-red-500 text-sm px-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <input
              className={`signUpFormField ${errors.password ? "border-red-500" : ""}`}
              type="password"
              value={inputPassword}
              onChange={(e) => {
                setInputPassword(e.target.value);
                if (errors.password)
                  setErrors((prev) => ({ ...prev, password: undefined }));
                // re-validate confirm if user fixes the base password
                if (inputConfirmPassword) {
                  setErrors((prev) => ({
                    ...prev,
                    confirmPassword:
                      e.target.value !== inputConfirmPassword
                        ? "Passwords don't match."
                        : undefined,
                  }));
                }
              }}
              onBlur={() =>
                setErrors((prev) => ({
                  ...prev,
                  password: validatePassword(inputPassword),
                }))
              }
              placeholder="Password"
              autoComplete="new-password"
              required
            />
            {errors.password && (
              <p className="text-red-500 text-sm px-1">{errors.password}</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <input
              className={`signUpFormField ${errors.confirmPassword ? "border-red-500" : ""}`}
              type="password"
              value={inputConfirmPassword}
              onChange={(e) => {
                setInputConfirmPassword(e.target.value);
                if (errors.confirmPassword)
                  setErrors((prev) => ({
                    ...prev,
                    confirmPassword: undefined,
                  }));
              }}
              onBlur={() =>
                setErrors((prev) => ({
                  ...prev,
                  confirmPassword:
                    validateConfirmPassword(inputConfirmPassword),
                }))
              }
              placeholder="Confirm Password"
              autoComplete="new-password"
              required
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm px-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {errors.form && (
            <p className="text-red-500 text-sm text-center">{errors.form}</p>
          )}

          <button
            disabled={!isFormComplete || isLoading}
            className="standardButton "
            style={{ background: token.light.primaryColor }}
            type="submit"
          >
            {isLoading ? "Creating account…" : "Continue"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignUpEmailPage;
