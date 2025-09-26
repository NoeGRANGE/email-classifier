export type TranslateFn = (key: string, fallback?: string) => string;

export const normaliseEmails = (list: string[]): Email[] =>
  list.map((address) => ({ email: address, activated: true }));
