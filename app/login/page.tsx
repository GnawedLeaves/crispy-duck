import { createClient } from "../utils/supabase/server";
import { cookies } from "next/headers";
import SignUpForm from "./components/signUpForm";
import SignInForm from "./components/signInForm";
import { getUserContext } from "../utils/login/authUtils";
import SignOutForm from "./components/signOutForm";

const LoginPage = async () => {
  return (
    <div className="contentLayout">
      LOGGED IN USER ID:
      <br />
      <br />
      <div>
        <SignUpForm />
      </div>
      <div>
        <SignInForm />
      </div>
      <div>
        <SignOutForm />
      </div>
    </div>
  );
};

export default LoginPage;
