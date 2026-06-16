import { ViewTransition } from "react";
import TestComponent from "./test";
import { TransitionLink } from "@/app/components/transition/transitionLink";

interface PageProps {
  params: Promise<{ pageState: string }>;
}

export default async function SignUpPages({ params }: PageProps) {
  // Await the params object
  const { pageState } = await params;
  const currentPage = parseInt(pageState, 10) || 0;

  return (
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
      <div key={currentPage}>
        <h1>User Profile</h1>
        <p>User ID from URL: {pageState}</p>
        <ViewTransition name="footer">
          <div className="flex gap-4">
            <TransitionLink
              direction="backwards"
              href={`/login/signUpTest/${currentPage - 1}`}
            >
              <button className="standardButton">Prev </button>
            </TransitionLink>
            <TransitionLink href={`/login/signUpTest/${currentPage + 1}`}>
              <button className="standardButton">Next </button>
            </TransitionLink>
          </div>
        </ViewTransition>

        <TestComponent />
      </div>
    </ViewTransition>
  );
}
