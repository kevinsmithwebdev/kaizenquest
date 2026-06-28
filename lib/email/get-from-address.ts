import { DEFAULT_FROM_ADDRESS } from "./email.constants";

export function getFromAddress(): string {
  return process.env.EMAIL_FROM ?? DEFAULT_FROM_ADDRESS;
}
