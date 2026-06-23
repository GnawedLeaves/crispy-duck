"use client";

import { useEffect, useState } from "react";

interface AnimatedLoadingTextProps {
  messages: string[];
  interval?: number; // time each message stays visible
  fadeDuration?: number; // fade animation duration
  className?: string;
}

export function AnimatedLoadingText({
  messages,
  interval = 2500,
  fadeDuration = 400,
  className = "",
}: AnimatedLoadingTextProps) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (messages.length <= 1) return;

    const timer = setInterval(() => {
      setVisible(false);

      setTimeout(() => {
        setIndex((prev) => (prev + 1) % messages.length);
        setVisible(true);
      }, fadeDuration);
    }, interval);

    return () => clearInterval(timer);
  }, [messages.length, interval, fadeDuration]);

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <p
        className="text-sm text-muted-foreground transition-opacity"
        style={{
          opacity: visible ? 1 : 0,
          transitionDuration: `${fadeDuration}ms`,
        }}
      >
        {messages[index]}
      </p>
    </div>
  );
}
