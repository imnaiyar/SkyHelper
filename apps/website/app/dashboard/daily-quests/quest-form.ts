"use client";

import { z } from "zod";

export type QuestImage = {
  url: string;
  by: string;
  source?: string;
};

export type DailyQuest = {
  title: string;
  date: string;
  description?: string;
  images: QuestImage[];
};

export type DailyQuestsResponse = {
  quests: DailyQuest[];
  last_updated: string;
  last_message?: string;
  rotating_candles: DailyQuest;
  seasonal_candles?: DailyQuest;
};

export type QuestImageFormValues = {
  url: string;
  by: string;
  source: string;
};

export type QuestFormValues = {
  title: string;
  date: string;
  description: string;
  images: QuestImageFormValues[];
};

export type DailyQuestsFormValues = {
  quests: QuestFormValues[];
  rotating_candles: QuestFormValues;
  seasonal_candles: QuestFormValues;
  seasonal_enabled: boolean;
  last_message: string;
  last_updated: string;
};

const dateSchema = z
  .string()
  .min(1, "Date is required.")
  .refine((value) => !Number.isNaN(new Date(value).getTime()), "Use YYYY-MM-DD.");

const questImageSchema = z.object({
  url: z.string().min(1, "Image URL is required."),
  by: z.string().min(1, "Credit is required."),
  source: z.string().optional(),
});

const questSchema = z.object({
  title: z.string().min(1, "Title is required."),
  date: dateSchema,
  description: z.string().optional(),
  images: z.array(questImageSchema),
});

export const dailyQuestsSchema = z
  .object({
    quests: z.array(questSchema),
    rotating_candles: questSchema,
    seasonal_candles: questSchema,
    seasonal_enabled: z.boolean(),
    last_message: z.string().optional(),
    last_updated: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.rotating_candles.images.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Rotating candle requires at least one image.",
        path: ["rotating_candles", "images"],
      });
    }

    if (data.seasonal_enabled && data.seasonal_candles.images.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Seasonal candle requires at least one image.",
        path: ["seasonal_candles", "images"],
      });
    }
  });

export const createEmptyQuest = (): QuestFormValues => ({
  title: "",
  date: new Date().toISOString().slice(0, 10),
  description: "",
  images: [],
});

const formatOptional = (value?: string) => {
  const trimmed = value?.trim() ?? "";
  return trimmed.length ? trimmed : undefined;
};

export const formatDateInput = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

export const formatDateDisplay = (value?: string) => {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
};

export const toIsoDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString();
};

export const toQuestFormValues = (quest?: DailyQuest): QuestFormValues => ({
  title: quest?.title ?? "",
  date: formatDateInput(quest?.date) || new Date().toISOString().slice(0, 10),
  description: quest?.description ?? "",
  images:
    quest?.images?.map((image) => ({
      url: image.url ?? "",
      by: image.by ?? "",
      source: image.source ?? "",
    })) ?? [],
});

export const toDailyQuestsFormValues = (data?: DailyQuestsResponse): DailyQuestsFormValues => ({
  quests: data?.quests?.map((quest) => toQuestFormValues(quest)) ?? [],
  rotating_candles: toQuestFormValues(data?.rotating_candles),
  seasonal_candles: toQuestFormValues(data?.seasonal_candles),
  seasonal_enabled: !!data?.seasonal_candles,
  last_message: data?.last_message ?? "",
  last_updated: data?.last_updated ?? "",
});

export const toQuestPayload = (quest: QuestFormValues): DailyQuest => ({
  title: quest.title.trim(),
  date: toIsoDate(quest.date),
  description: formatOptional(quest.description),
  images: quest.images.map((image) => ({
    url: image.url.trim(),
    by: image.by.trim(),
    source: formatOptional(image.source),
  })),
});
