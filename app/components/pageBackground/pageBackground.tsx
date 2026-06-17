"use client";

import { useEffect } from "react";

interface Props {
  color: string;
  children: React.ReactNode;
}

export default function PageBackground({ color, children }: Props) {
  useEffect(() => {
    document.documentElement.style.setProperty("--background", color);
  }, [color]);

  return <>{children}</>;
}
