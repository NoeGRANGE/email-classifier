"use client";

export const API_BASE = (process.env.NEXT_PUBLIC_BACKEND_URL || "").replace(/\/$/, "");

export async function apiRegister(token: string) {
  if (!API_BASE) throw new Error("Missing NEXT_PUBLIC_BACKEND_URL");
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({}),
  });
  if (!res.ok) throw new Error(`Register failed: ${res.status}`);
  return res.json();
}

export async function apiMe(token: string) {
  if (!API_BASE) throw new Error("Missing NEXT_PUBLIC_BACKEND_URL");
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Me failed: ${res.status}`);
  return res.json();
}

