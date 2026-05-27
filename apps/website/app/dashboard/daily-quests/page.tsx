"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "../../hooks/auth";
import { useToast } from "../../hooks/useToast";
import { useDiscordAuth } from "@components/auth/DiscordAuthContext";
import Loading from "@components/ui/Loading";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { isOwner } from "@/app/lib/owners";

type QuestImage = {
  url: string;
  by: string;
  source?: string;
};

type DailyQuest = {
  title: string;
  date: string;
  description?: string;
  images: QuestImage[];
};

type DailyQuestsResponse = {
  quests: DailyQuest[];
  last_updated: string;
  last_message?: string;
  rotating_candles: DailyQuest;
  seasonal_candles?: DailyQuest;
};

type QuestImageForm = {
  id: string;
  url: string;
  by: string;
  source: string;
};

type DailyQuestForm = {
  id: string;
  title: string;
  date: string;
  description: string;
  images: QuestImageForm[];
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

const createId = () => {
  if (typeof crypto !== "undefined") {
    if ("randomUUID" in crypto) return crypto.randomUUID();
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

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

const emptyQuest = (): DailyQuestForm => ({
  id: createId(),
  title: "",
  date: new Date().toISOString(),
  description: "",
  images: [],
});

const toQuestForm = (quest?: DailyQuest): DailyQuestForm => ({
  id: createId(),
  title: quest?.title ?? "",
  date: quest?.date ?? new Date().toISOString(),
  description: quest?.description ?? "",
  images:
    quest?.images?.map((image) => ({
      id: createId(),
      url: image.url ?? "",
      by: image.by ?? "",
      source: image.source ?? "",
    })) ?? [],
});

const formatDateInput = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const toIsoDate = (value: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString();
};

const normalizeQuest = (quest: DailyQuestForm, label: string, requireAtLeastOneImage: boolean) => {
  const title = quest.title.trim();
  if (!title) throw new Error(`${label} title is required.`);
  const dateValue = quest.date.trim();
  if (!dateValue) throw new Error(`${label} date is required.`);
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`${label} date is invalid. Use YYYY-MM-DD.`);
  }
  const images = quest.images.map((image, index) => {
    const url = image.url.trim();
    const by = image.by.trim();
    if (!url || !by) {
      throw new Error(`${label} image ${index + 1} must include a URL and credit.`);
    }
    const source = image.source.trim();
    return { url, by, source: source || undefined };
  });
  if (requireAtLeastOneImage && images.length === 0) {
    throw new Error(`${label} requires at least one image.`);
  }
  const description = quest.description.trim();
  return {
    title,
    date: parsed.toISOString(),
    description: description || undefined,
    images,
  };
};

type QuestEditorProps = {
  quest: DailyQuestForm;
  label: string;
  onChange: (next: DailyQuestForm) => void;
  onDelete?: () => void;
};

const QuestEditor = ({ quest, label, onChange, onDelete }: QuestEditorProps) => {
  const update = (changes: Partial<DailyQuestForm>) => onChange({ ...quest, ...changes });

  const updateImage = (index: number, changes: Partial<QuestImageForm>) => {
    const images = quest.images.map((image, idx) => (idx === index ? { ...image, ...changes } : image));
    update({ images });
  };

  const addImage = () => update({ images: [...quest.images, { id: createId(), url: "", by: "", source: "" }] });

  const removeImage = (index: number) => {
    const images = quest.images.filter((_, idx) => idx !== index);
    update({ images });
  };

  return (
    <div className="border border-slate-700/60 rounded-xl p-5 bg-slate-900/60 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-white">{label}</h3>
        {onDelete && (
          <button onClick={onDelete} className="px-3 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg">
            Delete
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-slate-300 mb-2">Title</label>
          <input
            className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
            value={quest.title}
            onChange={(event) => update({ title: event.target.value })}
            placeholder="Quest title"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-2">Date</label>
          <input
            type="date"
            className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
            value={formatDateInput(quest.date)}
            onChange={(event) => update({ date: toIsoDate(event.target.value) })}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-slate-300 mb-2">Description</label>
        <textarea
          className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white min-h-[90px]"
          value={quest.description}
          onChange={(event) => update({ description: event.target.value })}
          placeholder="Optional description"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-slate-300">Images</div>
          <button onClick={addImage} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg">
            Add Image
          </button>
        </div>

        {quest.images.length === 0 && <div className="text-sm text-slate-500">No images added yet.</div>}

        {quest.images.map((image, index) => (
          <div key={image.id} className="border border-slate-700 rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Image URL</label>
                <input
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                  value={image.url}
                  onChange={(event) => updateImage(index, { url: event.target.value })}
                  placeholder="https://"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Credit</label>
                <input
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                  value={image.by}
                  onChange={(event) => updateImage(index, { by: event.target.value })}
                  placeholder="@creator"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Source</label>
                <input
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                  value={image.source}
                  onChange={(event) => updateImage(index, { source: event.target.value })}
                  placeholder="Optional link"
                />
              </div>
              <button
                onClick={() => removeImage(index)}
                className="px-3 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function DailyQuestsPage() {
  const { session, status } = useSession();
  const { user, authState } = useDiscordAuth();
  const { success, error } = useToast();
  const queryClient = useQueryClient();
  const isOwnerUser = useMemo(() => isOwner(user?.id), [user?.id]);
  const [quests, setQuests] = useState<DailyQuestForm[]>([]);
  const [rotatingCandles, setRotatingCandles] = useState<DailyQuestForm>(emptyQuest());
  const [seasonalCandles, setSeasonalCandles] = useState<DailyQuestForm>(emptyQuest());
  const [seasonalEnabled, setSeasonalEnabled] = useState(false);
  const [lastMessage, setLastMessage] = useState<string | undefined>();
  const [lastUpdated, setLastUpdated] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);

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
    setQuests(data.quests?.map((quest) => toQuestForm(quest)) ?? []);
    setRotatingCandles(toQuestForm(data.rotating_candles));
    if (data.seasonal_candles) {
      setSeasonalEnabled(true);
      setSeasonalCandles(toQuestForm(data.seasonal_candles));
    } else {
      setSeasonalEnabled(false);
      setSeasonalCandles(emptyQuest());
    }
    setLastMessage(data.last_message);
    setLastUpdated(data.last_updated);
  }, [data]);

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

  const addQuest = () => setQuests((prev) => [...prev, emptyQuest()]);

  const updateQuest = (index: number, next: DailyQuestForm) => {
    setQuests((prev) => prev.map((quest, idx) => (idx === index ? next : quest)));
  };

  const deleteQuest = (index: number) => {
    setQuests((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSave = async () => {
    if (!session?.access_token) return;
    try {
      setIsSaving(true);
      const questsRequireImages = false;
      const candlesRequireImages = true;
      const normalizedQuests = quests.map((quest, index) => normalizeQuest(quest, `Quest ${index + 1}`, questsRequireImages));
      const normalizedRotating = normalizeQuest(rotatingCandles, "Rotating treasure candle", candlesRequireImages);
      const normalizedSeasonal = seasonalEnabled
        ? normalizeQuest(seasonalCandles, "Seasonal candle", candlesRequireImages)
        : undefined;
      const payload: DailyQuestsResponse = {
        quests: normalizedQuests,
        rotating_candles: normalizedRotating,
        seasonal_candles: normalizedSeasonal,
        last_message: lastMessage,
        last_updated: new Date().toISOString(),
      };
      await apiRequest<DailyQuestsResponse>(`${apiBaseUrl}/update/quests`, session.access_token, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      queryClient.invalidateQueries({ queryKey: ["daily-quests"] });
      success({ title: "Daily quests updated" });
    } catch (err) {
      error({ message: err instanceof Error ? err.message : "Failed to update daily quests." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Daily Quests</h1>
        <p className="text-slate-400">Update today&apos;s daily quests and candle locations.</p>
        {lastUpdated && <p className="text-xs text-slate-500 mt-2">Last updated: {lastUpdated}</p>}
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-white">Quest List</h2>
          <button onClick={addQuest} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
            Add Quest
          </button>
        </div>
        {isLoading && <Loading size="md" variant="bot" />}
        {isError && (
          <div className="text-red-400">{loadError instanceof Error ? loadError.message : "Failed to load daily quests."}</div>
        )}
        {!isLoading && !isError && quests.length === 0 && <div className="text-slate-400">No daily quests added yet.</div>}
        {!isLoading &&
          !isError &&
          quests.map((quest, index) => (
            <QuestEditor
              key={quest.id}
              quest={quest}
              label={`Quest ${index + 1}`}
              onChange={(next) => updateQuest(index, next)}
              onDelete={() => deleteQuest(index)}
            />
          ))}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Rotating Treasure Candle</h2>
        <QuestEditor quest={rotatingCandles} label="Rotating Treasure Candle" onChange={setRotatingCandles} />
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-white">Seasonal Candle</h2>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={seasonalEnabled}
              onChange={(event) => setSeasonalEnabled(event.target.checked)}
            />
            Enabled
          </label>
        </div>
        {seasonalEnabled ? (
          <QuestEditor quest={seasonalCandles} label="Seasonal Candle" onChange={setSeasonalCandles} />
        ) : (
          <div className="text-sm text-slate-400">Seasonal candle data will be omitted.</div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-700/60 pt-6">
        <div className="text-sm text-slate-500">Changes apply immediately to the daily quest API.</div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
