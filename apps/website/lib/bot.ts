import { mergeInits } from "@/lib/utils";

export function botRequest<T>(route: string, int?: RequestInit) {
  return fetch(
    process.env.NEXT_PUBLIC_API_URL + route,
    mergeInits({ headers: { "x-api-key": process.env.API_KEY ?? "", "Content-Type": "application/json" } }, int),
  ).then((b) => b.json()) as Promise<T>;
}
