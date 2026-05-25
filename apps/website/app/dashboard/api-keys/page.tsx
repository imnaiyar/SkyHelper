"use client";

import { useMemo, useState } from "react";
import { useSession } from "../../hooks/auth";
import { useToast } from "../../hooks/useToast";
import { useDiscordAuth } from "@components/auth/DiscordAuthContext";
import Loading from "@components/ui/Loading";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type ApiKeyRateLimit = {
  limit: number;
  ttl: number; // milliseconds
};

type ApiKey = {
  id: string;
  name: string;
  keyPrefix: string;
  isActive: boolean;
  rateLimit?: ApiKeyRateLimit | null;
  createdAt: string;
  updatedAt: string;
};

type ApiKeyCreatePayload = {
  name: string;
  rateLimit?: ApiKeyRateLimit;
  isActive?: boolean;
};

type ApiKeyUpdatePayload = {
  name?: string;
  rateLimit?: ApiKeyRateLimit | null;
  isActive?: boolean;
};

type ApiKeyCreateResponse = ApiKey & { apiKey: string };

const ownerIds = (process.env.NEXT_PUBLIC_OWNER_IDS ?? "")
  .split(",")
  .map((id) => id.trim())
  .filter(Boolean);

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

const toMilliseconds = (seconds: number) => seconds * 1000;

async function apiRequest<T>(url: string, token: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error ?? response.statusText);
  }

  return response.json() as Promise<T>;
}

export default function ApiKeysPage() {
  const { session, status } = useSession();
  const { user, authState } = useDiscordAuth();
  const { success, error } = useToast();
  const queryClient = useQueryClient();
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    useCustomRateLimit: false,
    limit: "",
    ttl: "",
    isActive: true,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    useCustomRateLimit: false,
    limit: "",
    ttl: "",
    isActive: true,
  });

  const isOwner = useMemo(() => (user?.id ? ownerIds.includes(user.id) : false), [user?.id]);

  const {
    data,
    isLoading,
    isError,
    error: loadError,
  } = useQuery<ApiKey[]>({
    queryKey: ["api-keys"],
    queryFn: () => apiRequest<ApiKey[]>(`${apiBaseUrl}/admin/api-keys`, session?.access_token ?? ""),
    enabled: !!session?.access_token && isOwner && !!apiBaseUrl,
  });

  if (status === "loading" || authState === "loading") {
    return <Loading size="lg" variant="bot" />;
  }

  if (!isOwner) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="text-slate-300 text-xl mb-2">🔒 Owner Only</div>
        <div className="text-slate-400 max-w-md">
          This section is only available to the bot owner. Please log in with the owner account.
        </div>
      </div>
    );
  }

  if (!apiBaseUrl) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="text-red-400 text-xl mb-2">⚠️ Missing API URL</div>
        <div className="text-slate-300">Configure NEXT_PUBLIC_API_URL to load API keys.</div>
      </div>
    );
  }

  const handleCreate = async () => {
    if (!session?.access_token) return;
    if (!form.name.trim()) {
      error({ message: "API key name is required." });
      return;
    }

    const payload: ApiKeyCreatePayload = { name: form.name.trim(), isActive: form.isActive };
    if (form.useCustomRateLimit) {
      const limit = Number(form.limit);
      const ttl = Number(form.ttl);
      if (!Number.isFinite(limit) || limit <= 0 || !Number.isFinite(ttl) || ttl <= 0) {
        error({ message: "Enter valid rate limit values." });
        return;
      }
      payload.rateLimit = { limit, ttl: toMilliseconds(ttl) };
    }

    try {
      const created = await apiRequest<ApiKeyCreateResponse>(`${apiBaseUrl}/admin/api-keys`, session.access_token, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setCreatedKey(created.apiKey);
      setForm({ name: "", useCustomRateLimit: false, limit: "", ttl: "", isActive: true });
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      success({ title: "API key created" });
    } catch (err) {
      error({ message: err instanceof Error ? err.message : "Failed to create API key." });
    }
  };

  const startEdit = (key: ApiKey) => {
    setEditingId(key.id);
    setEditForm({
      name: key.name,
      useCustomRateLimit: !!key.rateLimit,
      limit: key.rateLimit ? String(key.rateLimit.limit) : "",
      ttl: key.rateLimit ? String(key.rateLimit.ttl / 1000) : "",
      isActive: key.isActive,
    });
  };

  const handleUpdate = async (id: string) => {
    if (!session?.access_token) return;
    const payload: ApiKeyUpdatePayload = { name: editForm.name.trim(), isActive: editForm.isActive };
    if (!payload.name) {
      error({ message: "API key name is required." });
      return;
    }

    if (editForm.useCustomRateLimit) {
      const limit = Number(editForm.limit);
      const ttl = Number(editForm.ttl);
      if (!Number.isFinite(limit) || limit <= 0 || !Number.isFinite(ttl) || ttl <= 0) {
        error({ message: "Enter valid rate limit values." });
        return;
      }
      payload.rateLimit = { limit, ttl: toMilliseconds(ttl) };
    } else {
      payload.rateLimit = null;
    }

    try {
      await apiRequest<ApiKey>(`${apiBaseUrl}/admin/api-keys/${id}`, session.access_token, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      success({ title: "API key updated" });
    } catch (err) {
      error({ message: err instanceof Error ? err.message : "Failed to update API key." });
    }
  };

  const handleDelete = async (id: string) => {
    if (!session?.access_token) return;
    try {
      await apiRequest(`${apiBaseUrl}/admin/api-keys/${id}`, session.access_token, { method: "DELETE" });
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      success({ title: "API key deleted" });
    } catch (err) {
      error({ message: err instanceof Error ? err.message : "Failed to delete API key." });
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">API Keys</h1>
        <p className="text-slate-400">Create and manage API keys with custom rate limits.</p>
      </div>

      <div className="border border-slate-700/60 rounded-xl p-6 bg-slate-900/60">
        <h2 className="text-xl font-semibold text-white mb-4">Create API Key</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-300 mb-2">Name</label>
            <input
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Internal service"
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              id="api-key-active"
              type="checkbox"
              className="h-4 w-4"
              checked={form.isActive}
              onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))}
            />
            <label htmlFor="api-key-active" className="text-sm text-slate-300">
              Active
            </label>
          </div>
        </div>

        <div className="mt-4">
          <label className="flex items-center gap-3 text-sm text-slate-300">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={form.useCustomRateLimit}
              onChange={(event) => setForm((prev) => ({ ...prev, useCustomRateLimit: event.target.checked }))}
            />
            Use custom rate limit
          </label>
        </div>

        {form.useCustomRateLimit && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm text-slate-300 mb-2">Limit (requests)</label>
              <input
                type="number"
                min="1"
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                value={form.limit}
                onChange={(event) => setForm((prev) => ({ ...prev, limit: event.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-2">Window (seconds)</label>
              <input
                type="number"
                min="1"
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                value={form.ttl}
                onChange={(event) => setForm((prev) => ({ ...prev, ttl: event.target.value }))}
              />
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Create API Key
          </button>
          {createdKey && (
            <div className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-200">
              <div className="font-semibold text-white mb-1">New key (copy now):</div>
              <div className="break-all">{createdKey}</div>
            </div>
          )}
        </div>
      </div>

      <div className="border border-slate-700/60 rounded-xl p-6 bg-slate-900/60">
        <h2 className="text-xl font-semibold text-white mb-4">Existing Keys</h2>
        {isLoading && <Loading size="md" variant="bot" />}
        {isError && (
          <div className="text-red-400">{loadError instanceof Error ? loadError.message : "Failed to load API keys."}</div>
        )}
        {!isLoading && !isError && (!data || data.length === 0) && <div className="text-slate-400">No API keys created yet.</div>}
        {!isLoading && !isError && data && data.length > 0 && (
          <div className="space-y-4">
            {data.map((key) => {
              const isEditing = editingId === key.id;
              return (
                <div key={key.id} className="border border-slate-700 rounded-lg p-4">
                  {!isEditing ? (
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="text-white font-medium">{key.name}</div>
                        <div className="text-xs text-slate-400 mt-1">
                          Prefix: {key.keyPrefix} • {key.isActive ? "Active" : "Disabled"}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {key.rateLimit
                            ? `${key.rateLimit.limit} req / ${Math.round(key.rateLimit.ttl / 1000)}s`
                            : "Default rate limit"}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(key)}
                          className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(key.id)}
                          className="px-3 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-slate-300 mb-2">Name</label>
                          <input
                            className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                            value={editForm.name}
                            onChange={(event) => setEditForm((prev) => ({ ...prev, name: event.target.value }))}
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            id={`api-key-active-${key.id}`}
                            type="checkbox"
                            className="h-4 w-4"
                            checked={editForm.isActive}
                            onChange={(event) => setEditForm((prev) => ({ ...prev, isActive: event.target.checked }))}
                          />
                          <label htmlFor={`api-key-active-${key.id}`} className="text-sm text-slate-300">
                            Active
                          </label>
                        </div>
                      </div>

                      <label className="flex items-center gap-3 text-sm text-slate-300">
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={editForm.useCustomRateLimit}
                          onChange={(event) => setEditForm((prev) => ({ ...prev, useCustomRateLimit: event.target.checked }))}
                        />
                        Use custom rate limit
                      </label>

                      {editForm.useCustomRateLimit && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-slate-300 mb-2">Limit (requests)</label>
                            <input
                              type="number"
                              min="1"
                              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                              value={editForm.limit}
                              onChange={(event) => setEditForm((prev) => ({ ...prev, limit: event.target.value }))}
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-slate-300 mb-2">Window (seconds)</label>
                            <input
                              type="number"
                              min="1"
                              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                              value={editForm.ttl}
                              onChange={(event) => setEditForm((prev) => ({ ...prev, ttl: event.target.value }))}
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdate(key.id)}
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
