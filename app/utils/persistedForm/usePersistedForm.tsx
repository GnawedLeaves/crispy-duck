"use client";

import { ITautaScanData } from "@/app/types/commonTypes";
import { useEffect, useState } from "react";

const usePersistedForm = (key: string, initialData: ITautaScanData | null) => {
  const [formData, setFormData] = useState<ITautaScanData | null>(() => {
    if (typeof window === "undefined") return initialData;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : initialData;
  });

  useEffect(() => {
    if (formData) {
      localStorage.setItem(key, JSON.stringify(formData));
    }
  }, [formData, key]);

  const clearPersistence = () => {
    localStorage.removeItem(key);
    setFormData(null);
  };

  return { formData, setFormData, clearPersistence };
};

export default usePersistedForm;
