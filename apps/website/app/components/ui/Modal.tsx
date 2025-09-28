"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export default function Modal({
  children,
  isOpen,
  onCloseAction,
}: React.PropsWithChildren<{ isOpen: boolean; onCloseAction: () => void }>) {
  // Close modal on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCloseAction();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onCloseAction]);

  if (!isOpen) return null;

  return (
    <div className={isOpen ? "fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" : "hidden"}>
      <div className="relative bg-slate-800 rounded-2xl border border-slate-700 max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Close button */}
        <button
          onClick={onCloseAction}
          className="absolute top-4 right-4 z-20 w-10 h-10 bg-slate-900/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-slate-900 transition-colors duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="overflow-auto max-h-[90vh]">{children}</div>
      </div>
    </div>
  );
}

// Context-based Modal System
interface ModalContextType {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  toggleModal: () => void;
}

const ModalContext = createContext<ModalContextType | null>(null);

// Hook to use modal context
export function useModalContext() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModalContext must be used within a ModalProvider");
  }
  return context;
}

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);
  const toggleModal = () => setIsOpen(!isOpen);

  return <ModalContext.Provider value={{ isOpen, openModal, closeModal, toggleModal }}>{children}</ModalContext.Provider>;
}

export function ModalTrigger({ children }: { children: React.ReactNode }) {
  const { openModal } = useModalContext();

  return (
    <div onClick={openModal} className="cursor-pointer">
      {children}
    </div>
  );
}

export function ModalContent({ children }: { children: React.ReactNode }) {
  const { isOpen, closeModal } = useModalContext();

  return (
    <Modal isOpen={isOpen} onCloseAction={closeModal}>
      {children}
    </Modal>
  );
}
