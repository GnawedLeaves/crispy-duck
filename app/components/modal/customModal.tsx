"use client";
import { token } from "@/app/theme";
import { title } from "process";
import React, { useEffect, useRef } from "react";

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onActionClick?: () => void;
  actionButtonText?: string;
  closeButtonText?: string;

  modalType?: "action" | "default";
}
const CustomModal = ({
  isOpen,
  onClose,
  title,
  children,
  modalType = "default",
  onActionClick,
  actionButtonText,
  closeButtonText,
}: CustomModalProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      // .showModal() natively opens the dialog as a top-layer modal
      // and automatically disables background interaction
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);
  return (
    <dialog ref={dialogRef} className="modal" onClose={onClose}>
      <div
        className="modal-box cardWithShadow"
        style={{ background: token.light.background }}
      >
        <h3 className="font-bold text-lg">{title}</h3>
        <div className="py-2">{children}</div>

        <div className="modal-action">
          {modalType === "action" && (
            <button
              className="standardButton"
              onClick={onActionClick}
              style={{ background: token.light.primaryColor }}
            >
              {actionButtonText || "OK"}
            </button>
          )}

          <button className="standardButton" onClick={onClose}>
            {closeButtonText || "Close"}
          </button>
        </div>
      </div>
      {/* used for closing the dialog ignore this  */}
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>Close</button>
      </form>
    </dialog>
  );
};

export default CustomModal;
