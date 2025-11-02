import { useQuery } from "@tanstack/react-query";
import { AccessToken } from "../lib/auth/cookies";
export const Keys = {
  login: ["login"],
};

/**
 * Get discord oauth2 access token if logged in, otherwise return null
 */
async function auth() {
  const data = await fetch("/api/auth", {
    method: "GET",
    credentials: "include",
  });
  if (data.ok) return data.json() as Promise<AccessToken>;
  else throw { error: data.statusText };
}

type SessionResult = {
  status: "loading" | "unauthenticated" | "authenticated";
  session: AccessToken | null;
};
export function useSession(): SessionResult {
  const { isError, isLoading, data } = useQuery<AccessToken>({ queryKey: Keys.login, queryFn: () => auth(), retry: false });

  if (isError)
    return {
      status: "unauthenticated",
      session: null,
    };

  if (isLoading)
    return {
      status: "loading",
      session: null,
    };

  return {
    status: "authenticated",
    session: data ?? null,
  };
}
