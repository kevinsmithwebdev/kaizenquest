import { Resend } from "resend";

let resendClient: Resend | null | undefined;

export function getResendClient(): Resend | null {
  if (resendClient === undefined) {
    resendClient = process.env.RESEND_API_KEY
      ? new Resend(process.env.RESEND_API_KEY)
      : null;
  }

  return resendClient;
}

export function resetResendClientForTests(): void {
  resendClient = undefined;
}
