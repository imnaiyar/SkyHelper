import { getRoleConnections } from "@/app/lib/discord";
import { XCircleIcon } from "lucide-react";

const RoleCard = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-slate-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Linked Role Configuration</h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Configure your Sky: Children of the Light role connection metadata. This information can be used by Discord servers to
            automatically assign roles based on your game progress.
          </p>
        </div>
        <div className="relative bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="absolute right-6">
            <button className="text-slate-400 hover:text-white transition-colors p-1">
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
          <h2 className="text-2xl font-semibold text-white mb-6">Your Sky Profile</h2>
          {children}
        </div>

        <div className="mt-8 bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-medium text-white mb-3">How It Works</h3>
          <div className="space-y-3 text-slate-400">
            <p>
              • Your role connection metadata allows Discord servers to automatically assign roles based on your Sky: Children of
              the Light progress.
            </p>
            <p>
              • Server administrators can set up rules like "Must have 100+ wings" or "Must be a CR runner" to automatically grant
              specific roles.
            </p>
            <p>
              • This information is only shared with servers that you're a member of and that have configured SkyHelper's linked
              roles feature.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default async function LinkedRolePage() {
  const data = await getRoleConnections();
  if (!data)
    return (
      <RoleCard>
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400">Failed to get any role connections</p>
        </div>
      </RoleCard>
    );

  const { metadata } = data;
  return (
    <RoleCard>
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

          <div className="pt-6 border-t border-slate-700">
            <h3 className="text-lg font-medium text-white mb-3">Connected Account</h3>
            <p className="text-slate-400">Platform Username: {data.username || "Not set"}</p>
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
