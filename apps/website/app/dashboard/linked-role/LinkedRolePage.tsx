"use client";
import { type getRoleConnections } from "@/lib/discord";
import { ModalContent, ModalProvider, ModalTrigger } from "@/components/ui/Modal";
import { BadgeQuestionMarkIcon } from "lucide-react";
import { useState } from "react";

const RoleCard = ({ children }: { children: React.ReactNode }) => {
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
            {" "}
            <div className="p-6">
              <h3 className="text-lg font-medium text-white mb-3">How It Works</h3>
              <div className="space-y-3 text-slate-400">
                <p>
                  • Your role connection metadata allows Discord servers to automatically assign roles based on your Sky: Children
                  of the Light progress.
                </p>
                <p>
                  • Server administrators can set up rules like "Must have 100+ wings" or "Must be a CR runner" to automatically
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
};
export default function LinkedRolePage({ connections }: { connections?: Awaited<ReturnType<typeof getRoleConnections>> }) {
  const [editing, setEditing] = useState(false);
  if (!connections)
    return (
      <RoleCard>
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400">Failed to get any role connections</p>
        </div>
      </RoleCard>
    );

  const { metadata } = connections;
  return (
    <RoleCard>
      <div className="absolute top-6 right-6">
        <button onClick={() => setEditing(!editing)} className="text-slate-400 hover:text-white transition-colors p-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="m18.5 2.5 a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
          </svg>
        </button>
      </div>
      {metadata ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <p className="block text-sm font-medium text-slate-300 mb-2">Maximum Wings: {metadata.wings || 0}</p>

            <p className="block text-sm font-medium text-slate-300 mb-2">Playing Since: {metadata.since || 0}</p>

            <p className="block text-sm font-medium text-slate-300 mb-2">
              Candle Runner:{" "}
              {metadata.cr ? (
                <span className="text-green-500 text-sm">✔</span>
              ) : (
                <span className="text-red-500 text-sm">✖</span>
              )}
            </p>
            <p className="block text-sm font-medium text-slate-300 mb-2">
              Hangouts:{" "}
              {metadata.hangout ? (
                <span className="text-green-500 text-sm">✔</span>
              ) : (
                <span className="text-red-500 text-sm">✖</span>
              )}
            </p>
            <p className="block text-sm font-medium text-slate-300 mb-2">
              Eden Runner:{" "}
              {metadata.eden ? (
                <span className="text-green-500 text-sm">✔</span>
              ) : (
                <span className="text-red-500 text-sm">✖</span>
              )}
            </p>
          </div>

          <div className="pt-6 border-t border-slate-700 flex flex-col md:flex-row gap-2 justify-between items-center">
            <div>
              <h3 className="text-lg font-medium text-white mb-3">Connected Account</h3>
              <p className="text-slate-400 mb-4">Platform Username: {connections.username || "Not set"}</p>
            </div>

            {editing && (
              <div className="flex gap-3">
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // TODO: handle submit
                    setEditing(false);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Submit
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-slate-400 mb-4">No role metadata found.</p>
          <button
            /*   onClick={ TODO } */
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      )}
    </RoleCard>
  );
}
