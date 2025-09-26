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

  const contentType = res.headers.get("content-type") || "";

  if (!res.ok) {
    let serverMessage = "";
    try {
      if (contentType.includes("application/json")) {
        const data: any = await res.json();
        serverMessage =
          (typeof data?.message === "string" && data.message) ||
          (typeof data?.error === "string" && data.error) ||
          (typeof data?.detail === "string" && data.detail) ||
          (Array.isArray(data?.errors) &&
            typeof data.errors[0]?.message === "string" &&
            data.errors[0].message) ||
          (typeof data?.title === "string" && data.title) ||
          "";
        if (!serverMessage) {
          // fallback to a compact JSON string if we couldn't pick a field
          serverMessage = JSON.stringify(data);
        }
      } else {
        serverMessage = await res.text();
      }
    } catch {
      // ignore parse errors and fall back to generic message
    }

    const statusText = res.statusText || "";
    const errorPayload = {
      status: res.status,
      message: serverMessage || statusText || "Request failed",
    };
    throw new Error(JSON.stringify(errorPayload));
  }

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
): Promise<{ ok: boolean; organisation: OrganisationData }> {
  return fetchWithAuth<{ ok: boolean; organisation: OrganisationData }>({
    path: "/organisation",
    cookieHeader,
  });
}

export async function inviteToOrganisation(
  email: string,
  role: string,
  reservedSeats: number
): Promise<PlanInfo[]> {
  return fetchWithAuth<PlanInfo[]>({
    path: "/organisation/invite",
    method: "POST",
    body: { email, role, reservedSeats },
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

export async function removeOrganisationMember(memberId: number) {
  return fetchWithAuth({
    path: `/organisation/remove-member`,
    method: "DELETE",
    body: { memberId },
  });
}

export async function manageOrganisationMember(
  memberId: number,
  role: string,
  authorizedEmails: number
) {
  return fetchWithAuth({
    path: `/organisation/update-member`,
    method: "POST",
    body: { memberId, role, reservedSeats: authorizedEmails },
  });
}

// Emails

export async function listUserEmails(
  cookieHeader?: string
): Promise<{ ok: true; emails: string[] }> {
  return fetchWithAuth({ path: "/email/list", cookieHeader });
}
