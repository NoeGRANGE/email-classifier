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

export async function apiLogout() {
  return fetchWithAuth<{ ok: boolean }>({
    path: "/auth/logout",
    method: "POST",
    retryRefresh: false,
  });
}

export async function apiMe(cookieHeader?: string): Promise<RegisterResult> {
  return fetchWithAuth({ path: "/auth/me", cookieHeader });
}

export async function deleteAccount() {
  return fetchWithAuth<{ ok: boolean }>({
    path: "/auth/me",
    method: "DELETE",
  });
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
): Promise<{ ok: boolean; inviteLink: string }> {
  return fetchWithAuth<{ ok: boolean; inviteLink: string }>({
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

export async function createBillingCheckout(
  plan: Plan,
  locale?: string,
  cookieHeader?: string
) {
  return fetchWithAuth<BillingCheckoutResponse>({
    path: "/billing/checkout",
    method: "POST",
    body: { plan, ...(locale ? { locale } : {}) },
    cookieHeader,
  });
}

export async function openBillingPortal(cookieHeader?: string) {
  return fetchWithAuth<BillingPortalResponse>({
    path: "/billing/portal",
    method: "POST",
    cookieHeader,
  });
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

export async function listUserEmails(cookieHeader?: string): Promise<{
  ok: true;
  emails: {
    id: number;
    email: string;
    activated: boolean;
    configurationId: number | null;
  }[];
  hasMaxMailboxes: boolean;
}> {
  return fetchWithAuth({ path: "/email/list", cookieHeader });
}

export async function removeUserEmails(
  emailId: number,
  cookieHeader?: string
): Promise<{ ok: true }> {
  return fetchWithAuth({
    path: `/email/remove/${emailId}`,
    method: "DELETE",
    cookieHeader,
  });
}

export async function activateOrDeactivateUserEmails(
  emailId: number,
  cookieHeader?: string
): Promise<{ ok: true }> {
  return fetchWithAuth({
    path: `/email/activate/${emailId}`,
    method: "POST",
    cookieHeader,
  });
}

// configurations

export async function getConfigurations(
  cookieHeader?: string
): Promise<{ ok: boolean; configurations: Configuration[] }> {
  return fetchWithAuth<{ ok: boolean; configurations: Configuration[] }>({
    path: "/config/list",
    cookieHeader,
  });
}

export async function createConfiguration(
  name: string,
  emailId?: number
): Promise<{ ok: boolean; configId: number }> {
  const body: { name: string; emailId?: number } = { name };
  if (typeof emailId === "number") {
    body.emailId = emailId;
  }
  return fetchWithAuth<{ ok: boolean; configId: number }>({
    path: "/config/create",
    method: "POST",
    body,
  });
}

export async function getConfiguration(
  configId: string,
  cookieHeader?: string
): Promise<{ ok: boolean; configuration: ConfigurationDetail }> {
  return fetchWithAuth<{ ok: boolean; configuration: ConfigurationDetail }>({
    path: `/config/${configId}`,
    cookieHeader,
  });
}

export async function getCategory(
  categoryId: string,
  cookieHeader?: string
): Promise<{ ok: boolean; category: CategoryDetail }> {
  return fetchWithAuth<{ ok: boolean; category: CategoryDetail }>({
    path: `/config/category/${categoryId}`,
    cookieHeader,
  });
}

export async function getEmailTags(
  configurationId: number,
  cookieHeader?: string
): Promise<{
  ok: boolean;
  tags: Array<{ id: string; displayName: string; color?: string }>;
}> {
  return fetchWithAuth<{
    ok: boolean;
    tags: Array<{ id: string; displayName: string; color?: string }>;
  }>({
    path: `/config/tags/${configurationId}`,
    cookieHeader,
  });
}

export async function getEmailFolders(
  configurationId: number,
  cookieHeader?: string
): Promise<{
  ok: boolean;
  folders: { id: string; displayName: string }[];
}> {
  return fetchWithAuth<{
    ok: boolean;
    folders: { id: string; displayName: string }[];
  }>({
    path: `/config/folders/${configurationId}`,
    cookieHeader,
  });
}

export async function createCategory(
  name: string,
  description: string,
  configId: number,
  actions: { type: CategoryActionType; props: any }[],
  cookieHeader?: string
): Promise<{ ok: boolean }> {
  return fetchWithAuth<{ ok: boolean }>({
    path: `/config/category/create`,
    method: "POST",
    body: { name, description, configId, actions },
    cookieHeader,
  });
}

export async function updateCategory(
  id: number,
  name: string,
  description: string,
  configId: number,
  actions: { type: CategoryActionType; props: any }[],
  cookieHeader?: string
): Promise<{ ok: boolean }> {
  return fetchWithAuth<{ ok: boolean }>({
    path: `/config/category/update`,
    method: "POST",
    body: { id, name, description, configId, actions },
    cookieHeader,
  });
}

export async function getMeRole(cookieHeader?: string): Promise<{
  ok: boolean;
  role: string;
  activatedEmails: number;
  authorizedEmails: number;
}> {
  return fetchWithAuth<{
    ok: boolean;
    role: string;
    activatedEmails: number;
    authorizedEmails: number;
  }>({
    path: `/organisation/me-role`,
    cookieHeader,
  });
}
