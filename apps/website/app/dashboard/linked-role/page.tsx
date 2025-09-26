"use client";
import { useState, useEffect } from "react";
import { useDiscordAuth } from "../../components/auth/DiscordAuthContext";

// todo: this need updating
interface RoleConnectionMetadata {
  username?: string;
  metadata: {
    wings: number;
    since?: string;
    cr: boolean;
    eden: boolean;
    hangout: boolean;
  };
}
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
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
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
export default function LinkedRolePage() {
  const { user, authState } = useDiscordAuth();
  const [metadata, setMetadata] = useState<RoleConnectionMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoleMetadata = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/user/role-metadata", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch role metadata");
      }

      const data = await response.json();
      setMetadata(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const updateRoleMetadata = async (newMetadata: Partial<RoleConnectionMetadata["metadata"]>) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/user/role-metadata", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(newMetadata),
      });

      if (!response.ok) {
        throw new Error("Failed to update role metadata");
      }

      const data = await response.json();
      setMetadata(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRoleMetadata();
    }
  }, []);
  if (authState === "loading" || loading)
    return (
      <RoleCard>
        {" "}
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-slate-400">Loading your profile...</span>
        </div>
      </RoleCard>
    );

  if (error)
    return (
      <RoleCard>
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      </RoleCard>
    );
  return (
    <RoleCard>
      {metadata ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Maximum Wings</label>
                <input
                  type="number"
                  min="0"
                  max="200"
                  value={metadata.metadata.wings}
                  onChange={(e) => updateRoleMetadata({ wings: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Playing Since</label>
                <input
                  type="date"
                  value={metadata.metadata.since || ""}
                  onChange={(e) => updateRoleMetadata({ since: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Activities</label>

                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={metadata.metadata.cr}
                      onChange={(e) => updateRoleMetadata({ cr: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="ml-2 text-slate-300">CR/WL Runner</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={metadata.metadata.eden}
                      onChange={(e) => updateRoleMetadata({ eden: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="ml-2 text-slate-300">Eden Runner</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={metadata.metadata.hangout}
                      onChange={(e) => updateRoleMetadata({ hangout: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="ml-2 text-slate-300">Hangout Enjoyer</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-700">
            <h3 className="text-lg font-medium text-white mb-3">Connected Account</h3>
            <p className="text-slate-400">Platform Username: {metadata.username || "Not set"}</p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-slate-400 mb-4">No role metadata found.</p>
          <button
            onClick={fetchRoleMetadata}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      )}
    </RoleCard>
  );
}
