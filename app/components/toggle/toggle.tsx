"use client";

import { token } from "@/app/theme";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  ariaLabel?: string;
}

const Toggle = ({ checked, onChange, disabled, ariaLabel }: ToggleProps) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      style={{
        width: "3.25rem",
        height: "1.75rem",
        borderRadius: "999px",
        position: "relative",
        flexShrink: 0,
        padding: 2,
        border: `2px solid ${token.light.borderColor}`,
        background: checked ? token.light.primaryColor : token.light.background,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "background-color 0.15s ease",
      }}
    >
      <span
        style={{
          display: "block",
          width: "1.15rem",
          height: "1.15rem",
          borderRadius: "50%",
          background: token.light.textColor,
          transform: checked ? "translateX(1.5rem)" : "translateX(0)",
          transition: "transform 0.15s ease",
        }}
      />
    </button>
  );
};

export default Toggle;
