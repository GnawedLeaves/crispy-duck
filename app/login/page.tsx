"use client";

import SignUpForm from "./components/signUpForm";
import SignInForm from "./components/signInForm";
import { getUserContext } from "../utils/login/authUtils";
import SignOutForm from "./components/signOutForm";
import LandingPage from "./components/landingPage";
import { useState, ViewTransition } from "react";
import { PageState } from "../types/commonTypes";
import SignUpWizard from "./components/signUpWizard";
import ButtonBar from "./components/buttonBar";
import { token } from "../theme";
import PageBackground from "../components/pageBackground/pageBackground";

const LoginPage = () => {
  const [pageState, setPageState] = useState<PageState>("landing");
  const currentBgColor =
    pageState === "landing" ? token.light.primaryColor : token.light.background;
  return (
    <PageBackground color={currentBgColor}>
      <ViewTransition
        enter={{
          backwards: "exit-left",
          forwards: "enter-right",
          default: "auto",
        }}
        exit={{
          backwards: "none",
          forwards: "none",
          default: "auto",
        }}
      >
        <div key={pageState}>
          {pageState === "landing" && (
            <LandingPage setPageState={setPageState} />
          )}
          {pageState === "login" && <SignInForm setPageState={setPageState} />}
          {pageState === "signUp" && (
            <SignUpWizard setPageState={setPageState} />
          )}
        </div>
      </ViewTransition>
    </PageBackground>
  );
};

export default LoginPage;
