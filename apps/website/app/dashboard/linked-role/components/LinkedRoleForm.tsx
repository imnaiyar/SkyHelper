"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Check, Pencil, RotateCcw, Save, X } from "lucide-react";
import EditableField from "@components/ui/EditableField";
import Loading from "@components/ui/Loading";
import { useSession } from "@/app/hooks/auth";
import { useDiscordAuth } from "@components/auth/DiscordAuthContext";
import { useToast } from "@/app/hooks/useToast";
import {
  linkedRoleSchema,
  toLinkedRoleFormValues,
  toLinkedRolePayload,
  type LinkedRoleConnection,
  type LinkedRoleFormValues,
} from "../linked-role-form";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

async function apiRequest<T>(url: string, token: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: "Bearer " + token,
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

type LinkedRoleFormProps = {
  connections: LinkedRoleConnection;
};

export default function LinkedRoleForm({ connections }: LinkedRoleFormProps) {
  const { session, status } = useSession();
  const { user, authState } = useDiscordAuth();
  const { success, error } = useToast();
  const [editing, setEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<LinkedRoleFormValues>({
    resolver: zodResolver(linkedRoleSchema),
    defaultValues: toLinkedRoleFormValues(connections),
    mode: "onChange",
  });

  const { handleSubmit, formState, reset, register, control } = form;
  const watchedValues = useWatch({ control });
  const initialValuesRef = useRef(form.getValues());

  const canEdit = useMemo(() => !!session?.access_token && !!user?.id && !!apiBaseUrl, [session?.access_token, user?.id]);

  useEffect(() => {
    const values = toLinkedRoleFormValues(connections);
    reset(values);
    initialValuesRef.current = values;
  }, [connections, reset]);

  if (status === "loading" || authState === "loading") {
    return <Loading size="md" variant="bot" />;
  }

  if (!apiBaseUrl) {
    return <div className="text-slate-400">Configure NEXT_PUBLIC_API_URL to edit linked role metadata.</div>;
  }

  const toggleEditing = (next?: boolean) => {
    const top = window.scrollY;
    setEditing((prev) => (typeof next === "boolean" ? next : !prev));
    requestAnimationFrame(() => window.scrollTo({ top }));
  };

  const handleExitEdit = () => {
    const top = window.scrollY;
    if (formState.isDirty) {
      reset(initialValuesRef.current);
    }
    setEditing(false);
    requestAnimationFrame(() => window.scrollTo({ top }));
  };

  const onSubmit = handleSubmit(async (values) => {
    if (!session?.access_token || !user?.id) return;
    try {
      setIsSaving(true);
      const payload = toLinkedRolePayload(values);
      await apiRequest(`${apiBaseUrl}/users/${user.id}/linked-role`, session.access_token, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      reset(values);
      initialValuesRef.current = values;
      success({ title: "Linked role updated" });
    } catch (err) {
      error({ message: err instanceof Error ? err.message : "Failed to update linked role." });
    } finally {
      setIsSaving(false);
    }
  });

  const showActionBar = editing && formState.isDirty;
  const metadata = watchedValues?.metadata ?? connections.metadata;
  const username = watchedValues?.username ?? connections.username;

  return (
    <FormProvider {...form}>
      <motion.div layout className={`space-y-6 ${showActionBar ? "pb-20" : ""}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-wide text-slate-500">Maximum Wings</span>
              <EditableField
                editing={editing}
                display={<div className="min-h-[38px] rounded-lg px-3 py-2 text-slate-200">{metadata?.wings ?? "Not set"}</div>}
              >
                <input
                  {...register("metadata.wings", {
                    setValueAs: (value) => (value === "" ? undefined : Number(value)),
                  })}
                  type="number"
                  min={1}
                  max={240}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-white"
                  aria-label="Maximum wings"
                />
              </EditableField>
              {formState.errors.metadata?.wings?.message && (
                <p className="text-xs text-red-400">{formState.errors.metadata.wings.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase tracking-wide text-slate-500">Playing Since</span>
              <EditableField
                editing={editing}
                display={<div className="min-h-[38px] rounded-lg px-3 py-2 text-slate-200">{metadata?.since || "Not set"}</div>}
              >
                <input
                  {...register("metadata.since")}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-white"
                  aria-label="Playing since"
                  placeholder="2024-01-01"
                />
              </EditableField>
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase tracking-wide text-slate-500">Candle Runner</span>
              <EditableField
                editing={editing}
                display={
                  <div className="min-h-[38px] rounded-lg px-3 py-2 text-slate-200 flex items-center gap-2">
                    {metadata?.cr ? <Check className="text-emerald-400" size={16} /> : <X className="text-red-400" size={16} />}
                    {metadata?.cr ? "Yes" : "No"}
                  </div>
                }
              >
                <Controller
                  control={control}
                  name="metadata.cr"
                  render={({ field }) => (
                    <select
                      value={field.value ? "true" : "false"}
                      onChange={(event) => field.onChange(event.target.value === "true")}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-white"
                      aria-label="Candle runner"
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  )}
                />
              </EditableField>
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase tracking-wide text-slate-500">Hangouts</span>
              <EditableField
                editing={editing}
                display={
                  <div className="min-h-[38px] rounded-lg px-3 py-2 text-slate-200 flex items-center gap-2">
                    {metadata?.hangout ? <Check className="text-emerald-400" size={16} /> : <X className="text-red-400" size={16} />}
                    {metadata?.hangout ? "Yes" : "No"}
                  </div>
                }
              >
                <Controller
                  control={control}
                  name="metadata.hangout"
                  render={({ field }) => (
                    <select
                      value={field.value ? "true" : "false"}
                      onChange={(event) => field.onChange(event.target.value === "true")}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-white"
                      aria-label="Hangouts"
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  )}
                />
              </EditableField>
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase tracking-wide text-slate-500">Eden Runner</span>
              <EditableField
                editing={editing}
                display={
                  <div className="min-h-[38px] rounded-lg px-3 py-2 text-slate-200 flex items-center gap-2">
                    {metadata?.eden ? <Check className="text-emerald-400" size={16} /> : <X className="text-red-400" size={16} />}
                    {metadata?.eden ? "Yes" : "No"}
                  </div>
                }
              >
                <Controller
                  control={control}
                  name="metadata.eden"
                  render={({ field }) => (
                    <select
                      value={field.value ? "true" : "false"}
                      onChange={(event) => field.onChange(event.target.value === "true")}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-white"
                      aria-label="Eden runner"
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  )}
                />
              </EditableField>
            </div>
          </div>

          {canEdit && (
            <div className="mt-1">
              {editing ? (
                <button type="button" onClick={handleExitEdit} aria-label="Exit edit mode" className="text-slate-300 hover:text-white">
                  <X size={18} />
                </button>
              ) : (
                <button type="button" onClick={() => toggleEditing(true)} aria-label="Enter edit mode" className="text-slate-300 hover:text-white">
                  <Pencil size={18} />
                </button>
              )}
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-slate-700 flex flex-col md:flex-row gap-2 justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-white mb-3">Connected Account</h3>
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-wide text-slate-500">Platform Username</span>
              <EditableField
                editing={editing}
                display={<div className="min-h-[38px] rounded-lg px-3 py-2 text-slate-200">{username || "Not set"}</div>}
              >
                <input
                  {...register("username")}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-white"
                  aria-label="Platform username"
                />
              </EditableField>
            </div>
          </div>
        </div>
      </motion.div>

      {showActionBar && (
        <div className="fixed inset-x-0 bottom-0 border-t border-slate-700/60 bg-slate-950/80 backdrop-blur">
          <div className="container mx-auto px-4 py-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => reset(initialValuesRef.current)}
              aria-label="Reset changes"
              className="text-slate-300 hover:text-white"
            >
              <RotateCcw size={18} />
            </button>
            <button
              type="button"
              onClick={onSubmit}
              aria-label="Save changes"
              disabled={isSaving}
              className="text-emerald-300 hover:text-emerald-200 disabled:opacity-60"
            >
              <Save size={18} />
            </button>
          </div>
        </div>
      )}
    </FormProvider>
  );
}
