"use client";
import { token } from "@/app/theme";
import { createContext, useContext, useState, useCallback } from "react";

interface Toast {
  id: number;
  message: string;
  backgroundColor: string;
  duration: number;
}

const ToastContext = createContext<{
  triggerToast: (
    message: string,
    backgroundColor?: string,
    duration?: number,
  ) => void;
} | null>(null);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const triggerToast = useCallback(
    (
      message: string,
      backgroundColor = token.light.primaryColor,
      duration = 5000,
    ) => {
      const id = Date.now();
      setToasts((prev) => [
        ...prev,
        { id, message, backgroundColor, duration },
      ]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    },
    [],
  );

  return (
    <ToastContext.Provider value={{ triggerToast }}>
      {children}
      <div className="toast toast-center toast-top z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`alert animate-in slide-in-from-top fade-in duration-300 cardWithShadow`}
            style={{
              backgroundColor: toast.backgroundColor,
              color: token.light.textColor,
            }}
          >
            <span className="text-md">{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};
