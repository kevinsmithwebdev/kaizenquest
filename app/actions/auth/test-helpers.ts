import { expect } from "vitest";

export class RedirectError extends Error {
  constructor(readonly url: string) {
    super("NEXT_REDIRECT");
    this.name = "RedirectError";
  }
}

export function createFormData(entries: Record<string, string>): FormData {
  const formData = new FormData();

  for (const [key, value] of Object.entries(entries)) {
    formData.set(key, value);
  }

  return formData;
}

export async function expectRedirect(
  promise: Promise<unknown>,
  url: string,
): Promise<void> {
  await expect(promise).rejects.toMatchObject({ url });
}
