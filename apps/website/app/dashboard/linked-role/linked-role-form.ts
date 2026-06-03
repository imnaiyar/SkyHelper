"use client";

import { z } from "zod";

export type LinkedRoleConnection = {
  username?: string;
  metadata?: {
    wings?: number;
    since?: string;
    eden?: boolean;
    cr?: boolean;
    hangout?: boolean;
  };
};

export type LinkedRoleFormValues = {
  username: string;
  metadata: {
    wings?: number;
    since: string;
    eden: boolean;
    cr: boolean;
    hangout: boolean;
  };
};

const optionalNumber = z.preprocess((value) => {
  if (value === null || value === undefined || value === \"\") return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? value : parsed;
}, z.number().min(1, \"Wings must be at least 1.\").max(240, \"Wings cannot exceed 240.\").optional());

export const linkedRoleSchema = z.object({
  username: z.string(),
  metadata: z.object({
    wings: optionalNumber,
    since: z.string(),
    eden: z.boolean(),
    cr: z.boolean(),
    hangout: z.boolean(),
  }),
});

const formatOptional = (value?: string) => {
  const trimmed = value?.trim() ?? \"\";
  return trimmed.length ? trimmed : undefined;
};

export const toLinkedRoleFormValues = (connections?: LinkedRoleConnection): LinkedRoleFormValues => ({
  username: connections?.username ?? \"\",
  metadata: {
    wings: connections?.metadata?.wings ?? undefined,
    since: connections?.metadata?.since ?? \"\",
    eden: connections?.metadata?.eden ?? false,
    cr: connections?.metadata?.cr ?? false,
    hangout: connections?.metadata?.hangout ?? false,
  },
});

export const toLinkedRolePayload = (values: LinkedRoleFormValues) => ({
  username: formatOptional(values.username),
  metadata: {
    wings: values.metadata.wings,
    since: formatOptional(values.metadata.since),
    eden: values.metadata.eden,
    cr: values.metadata.cr,
    hangout: values.metadata.hangout,
  },
});
