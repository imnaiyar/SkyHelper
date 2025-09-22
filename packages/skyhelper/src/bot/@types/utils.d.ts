import type { LangKeys } from "./i18n.js";

export type Awaitable<T> = T | PromiseLike<T>;

export type If<Value extends boolean, TrueResult, FalseResult = null> = Value extends true
  ? TrueResult
  : Value extends false
    ? FalseResult
    : TrueResult | FalseResult;

export type OverrideLocalizations<T> =
  T extends Array<infer U>
    ? Array<OverrideLocalizations<U>>
    : T extends object
      ? {
          [K in keyof T]: K extends "description_localizations" | "name_localizations" ? LangKeys : OverrideLocalizations<T[K]>; // Recursively process nested objects
        }
      : T;

export type IdResolvalble = { id: string } | string | { user: { id: string } };

export interface ParsedCustomId {
  id: string;
  user?: string;
  [key: string]: string;
}

export type TimestampStyles = "d" | "D" | "f" | "F" | "t" | "T" | "R";
