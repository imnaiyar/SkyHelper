import crypto from "node:crypto";
import { Schema, model } from "mongoose";
import type { ApiKeySchema } from "@/types/schemas";

const RateLimitSchema = new Schema(
  {
    limit: { type: Number, required: true },
    ttl: { type: Number, required: true },
  },
  { _id: false },
);

const SchemaDef = new Schema<ApiKeySchema>(
  {
    name: { type: String, required: true },
    keyHash: { type: String, required: true, index: true, unique: true },
    keyPrefix: { type: String, required: true },
    createdBy: { type: String, required: true },
    rateLimit: { type: RateLimitSchema, default: undefined },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const Model = model<ApiKeySchema>("api-keys", SchemaDef);

export { Model as ApiKeyModel };

export function hashApiKey(apiKey: string) {
  return crypto.createHash("sha256").update(apiKey).digest("hex");
}

export function generateApiKey() {
  const apiKey = crypto.randomBytes(32).toString("base64url");
  return {
    apiKey,
    keyPrefix: apiKey.slice(0, 8),
    keyHash: hashApiKey(apiKey),
  };
}
