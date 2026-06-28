import { VERIFICATION_EMAIL_SUBJECT } from "./email.constants";
import type { SendVerificationEmailParams } from "./email.types";
import { escapeHtml } from "./escape-html";
import { getFromAddress } from "./get-from-address";
import { getResendClient } from "./get-resend-client";

export async function sendVerificationEmail(
  params: SendVerificationEmailParams,
): Promise<void> {
  const { to, name, code } = params;
  const resend = getResendClient();

  if (!resend) {
    console.log("\n--- Verification email (dev — no RESEND_API_KEY) ---");
    console.log(`To: ${to}`);
    console.log(`Hi ${name}, your verification code is: ${code}`);
    console.log("Enter it at /verify-email");
    console.log("------------------------------------------------------\n");
    return;
  }

  const safeName = escapeHtml(name);

  const { error } = await resend.emails.send({
    from: getFromAddress(),
    to,
    subject: VERIFICATION_EMAIL_SUBJECT,
    html: `
      <p>Hi ${safeName},</p>
      <p>Your verification code is:</p>
      <p style="font-size: 24px; font-weight: bold; letter-spacing: 0.2em;">${code}</p>
      <p>Enter this code on the verify email page to activate your account.</p>
      <p>This code expires in 24 hours.</p>
    `,
    text: `Hi ${name},\n\nYour verification code is: ${code}\n\nEnter this code on the verify email page to activate your account.\n\nThis code expires in 24 hours.`,
  });

  if (error) {
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
}
