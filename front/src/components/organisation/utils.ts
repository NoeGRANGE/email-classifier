export const ROLE_PRIORITY = ["member", "admin"] as const;

export type TranslateFn = (key: string, fallback?: string) => string;

export function normaliseKey(value: string | null | undefined) {
  return (value ?? "").toLowerCase();
}

export function prettifyLabel(value: string | null | undefined) {
  if (!value) return "—";
  return value
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .replace(
      /(^|\s)([a-z])/g,
      (_match, start, letter) => `${start}${letter.toUpperCase()}`
    )
    .trim();
}

export function formatTemplate(
  template: string,
  replacements: Record<string, string | number>
): string {
  return Object.entries(replacements).reduce((acc, [key, value]) => {
    const pattern = new RegExp(`\\{${key}\\}`, "g");
    return acc.replace(pattern, String(value));
  }, template);
}

export type NormalisedMember = OrganisationData["members"][number] & {
  _roleKey: string;
  _statusKey: string;
};

export function enrichMembers(members: OrganisationData["members"]) {
  return members.map<NormalisedMember>((member) => ({
    ...member,
    _roleKey: normaliseKey(member.role),
    _statusKey: normaliseKey(member.status),
  }));
}
