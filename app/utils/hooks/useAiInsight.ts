"use client";

import { useState } from "react";
import { GenerateAiOptions, generateGenericAiAction } from "../ai/actions";

export function useAiInsight() {
  const [insight, setInsight] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async (options: GenerateAiOptions) => {
    setIsLoading(true);
    setError(null);

    const result = await generateGenericAiAction(options);

    if (result.success && result.text) {
      setInsight(result.text);
    } else {
      setError(result.error || "Failed to generate response");
    }

    setIsLoading(false);
  };

  const clear = () => {
    setInsight(null);
    setError(null);
  };

  return {
    insight,
    isLoading,
    error,
    generate,
    clear,
  };
}
