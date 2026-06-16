"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { addTransitionType, startTransition } from "react";

interface TransitionLinkProps {
  href: string;
  direction?: "forwards" | "backwards";
  children: React.ReactNode;
}
export const TransitionLink = ({
  href,
  direction = "forwards",
  children,
}: TransitionLinkProps) => {
  const router = useRouter();
  const handleNavigate = (event: any) => {
    event.preventDefault();
    startTransition(() => {
      addTransitionType(direction);
      router.push(href);
    });
  };
  return (
    <Link href={href} onClick={handleNavigate}>
      {children}
    </Link>
  );
};
