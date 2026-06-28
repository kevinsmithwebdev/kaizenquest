import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

function getFromAddress(): string {
  return process.env.EMAIL_FROM ?? "Kaizen Quest <onboarding@resend.dev>";
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendVerificationEmail(params: {
  to: string;
  name: string;
  code: string;
}): Promise<void> {
  const { to, name, code } = params;

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
    subject: "Verify your Kaizen Quest account",
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
