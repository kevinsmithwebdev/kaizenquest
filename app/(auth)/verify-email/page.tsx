import { Mail } from "lucide-react";

import { VerifyEmailForm } from "@/components/verify-email-form";

type VerifyEmailPageProps = {
  searchParams: Promise<{ email?: string }>;
};

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const { email } = await searchParams;

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-brand text-brand-foreground">
          <Mail className="size-6" aria-hidden />
        </div>
        <h1 className="text-2xl font-semibold text-foreground">Verify your email</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter the 8-character code we sent to your email.
        </p>
      </div>

      <VerifyEmailForm defaultEmail={email ?? ""} />
    </div>
  );
}
