"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Pencil, Plus, RotateCcw, Save, X } from "lucide-react";
import { FormProvider, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "../../hooks/auth";
import { useToast } from "../../hooks/useToast";
import { useDiscordAuth } from "@components/auth/DiscordAuthContext";
import Loading from "@components/ui/Loading";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { isOwner } from "@/app/lib/owners";
import { motion } from "framer-motion";
import EditableField from "@components/ui/EditableField";
import QuestCard from "./components/QuestCard";
import {
  createEmptyQuest,
  dailyQuestsSchema,
  formatDateDisplay,
  toDailyQuestsFormValues,
  toQuestPayload,
  type DailyQuestsFormValues,
  type DailyQuestsResponse,
} from "./quest-form";

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

export default function DailyQuestsPage() {
  const { session, status } = useSession();
  const { user, authState } = useDiscordAuth();
  const { success, error } = useToast();
  const queryClient = useQueryClient();
  const isOwnerUser = useMemo(() => isOwner(user?.id), [user?.id]);
  const [editing, setEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [questListExpanded, setQuestListExpanded] = useState(true);
  const [rotatingExpanded, setRotatingExpanded] = useState(true);
  const [seasonalExpanded, setSeasonalExpanded] = useState(true);

  const form = useForm<DailyQuestsFormValues>({
    resolver: zodResolver(dailyQuestsSchema),
    defaultValues: toDailyQuestsFormValues(),
    mode: "onChange",
  });

  const { control, handleSubmit, formState, reset } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "quests", keyName: "fieldId" });
  const seasonalEnabled = useWatch({ control, name: "seasonal_enabled" });
  const lastUpdated = useWatch({ control, name: "last_updated" });
  const initialValuesRef = useRef(form.getValues());

  const {
    data,
    isLoading,
    isError,
    error: loadError,
  } = useQuery<DailyQuestsResponse>({
    queryKey: ["daily-quests"],
    queryFn: () => apiRequest<DailyQuestsResponse>(`${apiBaseUrl}/update/quests`, session?.access_token ?? ""),
    enabled: !!session?.access_token && isOwnerUser && !!apiBaseUrl,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!data) return;
    const values = toDailyQuestsFormValues(data);
    reset(values);
    initialValuesRef.current = values;
  }, [data, reset]);

  if (status === "loading" || authState === "loading") {
    return <Loading size="lg" variant="bot" />;
  }

  if (!isOwnerUser) {
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
        <div className="text-slate-300">Configure NEXT_PUBLIC_API_URL to load daily quests.</div>
      </div>
    );
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

  const addQuest = () => append(createEmptyQuest());

  const onSubmit = handleSubmit(async (values) => {
    if (!session?.access_token) return;
    try {
      setIsSaving(true);
      const payload: DailyQuestsResponse = {
        quests: values.quests.map((quest) => toQuestPayload(quest)),
        rotating_candles: toQuestPayload(values.rotating_candles),
        seasonal_candles: values.seasonal_enabled ? toQuestPayload(values.seasonal_candles) : undefined,
        last_message: values.last_message || undefined,
        last_updated: new Date().toISOString(),
      };
      await apiRequest<DailyQuestsResponse>(`${apiBaseUrl}/update/quests`, session.access_token, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      const nextValues = {
        ...values,
        last_updated: payload.last_updated,
      };
      reset(nextValues);
      initialValuesRef.current = nextValues;
      queryClient.invalidateQueries({ queryKey: ["daily-quests"] });
      success({ title: "Daily quests updated" });
    } catch (err) {
      error({ message: err instanceof Error ? err.message : "Failed to update daily quests." });
    } finally {
      setIsSaving(false);
    }
  });

  const showActionBar = editing && formState.isDirty;

  return (
    <>
      <FormProvider {...form}>
        <div className={`container mx-auto px-4 py-6 space-y-8 ${showActionBar ? "pb-24" : ""}`}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Daily Quests</h1>
              <p className="text-slate-400">Update today&apos;s daily quests and candle locations.</p>
              {lastUpdated && <p className="text-xs text-slate-500 mt-2">Last updated: {formatDateDisplay(lastUpdated)}</p>}
            </div>
            <div>
              {editing ? (
                <button
                  type="button"
                  onClick={handleExitEdit}
                  aria-label="Exit edit mode"
                  className="text-slate-300 hover:text-white"
                >
                  <X size={18} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => toggleEditing(true)}
                  aria-label="Enter edit mode"
                  className="text-slate-300 hover:text-white"
                >
                  <Pencil size={18} />
                </button>
              )}
            </div>
          </div>

          <motion.div layout className="space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuestListExpanded((prev) => !prev)}
                    className="text-white"
                    aria-expanded={questListExpanded}
                    aria-label={questListExpanded ? "Collapse quest list" : "Expand quest list"}
                  >
                    <ChevronDown className={`h-4 w-4 transition-transform ${questListExpanded ? "rotate-180" : ""}`} />
                  </button>
                  <h2 className="text-xl font-semibold text-white">Quest List</h2>
                </div>
                {editing && (
                  <button type="button" onClick={addQuest} aria-label="Add quest" className="text-white">
                    <Plus size={18} />
                  </button>
                )}
              </div>
              {questListExpanded && (
                <div className="space-y-4">
                  {isLoading && <Loading size="md" variant="bot" />}
                  {isError && (
                    <div className="text-red-400">
                      {loadError instanceof Error ? loadError.message : "Failed to load daily quests."}
                    </div>
                  )}
                  {!isLoading && !isError && fields.length === 0 && (
                    <div className="text-slate-400">No daily quests added yet.</div>
                  )}
                  {!isLoading &&
                    !isError &&
                    fields.map((field, index) => (
                      <QuestCard
                        key={field.fieldId}
                        name={`quests.${index}`}
                        label={`Quest ${index + 1}`}
                        editing={editing}
                        onRemove={editing ? () => remove(index) : undefined}
                        errors={formState.errors.quests?.[index]}
                      />
                    ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setRotatingExpanded((prev) => !prev)}
                    className="text-white"
                    aria-expanded={rotatingExpanded}
                    aria-label={
                      rotatingExpanded ? "Collapse rotating treasure candle section" : "Expand rotating treasure candle section"
                    }
                  >
                    <ChevronDown className={`h-4 w-4 transition-transform ${rotatingExpanded ? "rotate-180" : ""}`} />
                  </button>
                  <h2 className="text-xl font-semibold text-white">Rotating Treasure Candle</h2>
                </div>
              </div>
              {rotatingExpanded && (
                <QuestCard
                  name="rotating_candles"
                  label="Rotating Treasure Candle"
                  editing={editing}
                  errors={formState.errors.rotating_candles}
                />
              )}
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSeasonalExpanded((prev) => !prev)}
                    className="text-white"
                    aria-expanded={seasonalExpanded}
                    aria-label={seasonalExpanded ? "Collapse seasonal candle section" : "Expand seasonal candle section"}
                  >
                    <ChevronDown className={`h-4 w-4 transition-transform ${seasonalExpanded ? "rotate-180" : ""}`} />
                  </button>
                  <h2 className="text-xl font-semibold text-white">Seasonal Candle</h2>
                </div>
                <div className="min-w-[140px]">
                  <EditableField
                    editing={editing}
                    display={
                      <div className="rounded-lg px-3 py-2 text-sm text-slate-300">
                        {seasonalEnabled ? "Enabled" : "Disabled"}
                      </div>
                    }
                  >
                    <select
                      {...form.register("seasonal_enabled", {
                        setValueAs: (value) => value === "true",
                      })}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-white"
                      aria-label="Seasonal candle enabled"
                    >
                      <option value="true">Enabled</option>
                      <option value="false">Disabled</option>
                    </select>
                  </EditableField>
                </div>
              </div>
              {seasonalExpanded &&
                (seasonalEnabled ? (
                  <QuestCard
                    name="seasonal_candles"
                    label="Seasonal Candle"
                    editing={editing}
                    errors={formState.errors.seasonal_candles}
                  />
                ) : (
                  <div className="text-sm text-slate-400">Seasonal candle data will be omitted.</div>
                ))}
            </div>
          </motion.div>
        </div>
      </FormProvider>
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
    </>
  );
}
