export const API_BASE = (process.env.NEXT_PUBLIC_BACKEND_URL || "").replace(
  /\/$/,
  ""
);

const isServer = typeof window === "undefined";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type FetchWithAuthOptions = {
  path: string;
  method?: HttpMethod;
  body?: unknown;
  cookieHeader?: string;
  retryRefresh?: boolean;
  extraHeaders?: Record<string, string>;
};

async function fetchWithAuth<T = any>({
  path,
  method = "GET",
  body,
  cookieHeader,
  retryRefresh = true,
  extraHeaders = {},
}: FetchWithAuthOptions): Promise<T> {
  if (!API_BASE) throw new Error("Missing NEXT_PUBLIC_BACKEND_URL");
  if (!path.startsWith("/"))
    throw new Error(`Path must start with "/": ${path}`);

  const url = `${API_BASE}${path}`;

  const baseHeaders: Record<string, string> = {
    ...(body != null ? { "Content-Type": "application/json" } : {}),
    ...extraHeaders,
  };

  let res = await fetch(url, {
    method,
    ...(isServer
      ? {
          headers: {
            ...baseHeaders,
            ...(cookieHeader ? { cookie: cookieHeader } : {}),
          },
        }
      : { headers: baseHeaders, credentials: "include" as const }),
    ...(body != null
      ? { body: typeof body === "string" ? body : JSON.stringify(body) }
      : {}),
  });

  // If unauthorized, try a refresh once, then retry
  if (res.status === 401 && retryRefresh) {
    const refreshed = await refreshSession(isServer ? cookieHeader : undefined);
    if (!refreshed.ok) {
      throw new Error("Not authenticated");
    }
    // If server and Set-Cookie returned, forward it on retry
    const retryCookie =
      isServer && refreshed.setCookie ? refreshed.setCookie : cookieHeader;

    res = await fetch(url, {
      method,
      ...(isServer
        ? {
            headers: {
              ...baseHeaders,
              ...(retryCookie ? { cookie: retryCookie } : {}),
            },
          }
        : { headers: baseHeaders, credentials: "include" as const }),
      ...(body != null
        ? { body: typeof body === "string" ? body : JSON.stringify(body) }
        : {}),
    });
  }

  if (!res.ok) throw new Error(`${method} ${path} failed: ${res.status}`);
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json() as Promise<T>;
  }
  return (await res.text()) as unknown as T;
}

async function refreshSession(cookieHeader?: string) {
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    ...(isServer
      ? { headers: cookieHeader ? { cookie: cookieHeader } : undefined }
      : { credentials: "include" }),
  });
  const setCookie = res.headers.get("set-cookie") || undefined;
  return { ok: res.ok, setCookie };
}

export async function apiRegister(accessToken: string, refreshToken?: string) {
  return fetchWithAuth({
    path: "/auth/register",
    method: "POST",
    body: { accessToken, refreshToken },
  });
}

export async function apiLogin(accessToken: string, refreshToken?: string) {
  return fetchWithAuth({
    path: "/auth/login",
    method: "POST",
    body: { accessToken, refreshToken },
  });
}

export async function apiMe(cookieHeader?: string): Promise<RegisterResult> {
  return fetchWithAuth({ path: "/auth/me", cookieHeader });
}

export async function joinOrganisation(token: string, cookieHeader?: string) {
  return fetchWithAuth({
    path: "/organisation/join",
    method: "POST",
    body: { token },
    cookieHeader,
  });
}

export async function getOrganisationData(
  cookieHeader?: string
): Promise<OrganisationData> {
  return fetchWithAuth<OrganisationData>({
    path: "/organisation",
    cookieHeader,
  });
}

// Billing
export async function getBillingInfo(
  cookieHeader?: string
): Promise<BillingInfo> {
  return fetchWithAuth<BillingInfo>({ path: "/billing/me", cookieHeader });
}

export async function getBillingPlans(
  cookieHeader?: string
): Promise<PlanInfo[]> {
  return fetchWithAuth<PlanInfo[]>({ path: "/billing/plans", cookieHeader });
}
