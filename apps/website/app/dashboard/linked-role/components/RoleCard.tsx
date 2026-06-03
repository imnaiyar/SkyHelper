"use client";

import { ModalContent, ModalProvider, ModalTrigger } from "@components/ui/Modal";
import { BadgeQuestionMarkIcon } from "lucide-react";

export default function RoleCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Linked Role Configuration</h1>
        <p className="text-slate-400">
          Configure your Sky: Children of the Light role connection metadata. This information can be used by Discord servers to
          automatically assign roles based on your game progress.
        </p>
      </div>
      <div className="relative max-w-2xl w-full items-center border border-slate-700 rounded-xl p-6">
        <ModalProvider>
          <h2 className="text-2xl flex gap-2 font-semibold text-white mb-6">
            Your Sky Profile{" "}
            <ModalTrigger>
              <BadgeQuestionMarkIcon />
            </ModalTrigger>
          </h2>
          <ModalContent>
            <div className="p-6">
              <h3 className="text-lg font-medium text-white mb-3">How It Works</h3>
              <div className="space-y-3 text-slate-400">
                <p>
                  • Your role connection metadata allows Discord servers to automatically assign roles based on your Sky: Children
                  of the Light progress.
                </p>
                <p>
                  • Server administrators can set up rules like \"Must have 100+ wings\" or \"Must be a CR runner\" to automatically
                  grant specific roles.
                </p>
                <p>
                  • This information is only shared with servers that you're a member of and that have configured SkyHelper's
                  linked roles feature.
                </p>
              </div>
            </div>
          </ModalContent>
        </ModalProvider>
        {children}
      </div>
    </div>
  );
}
