import { Mail } from "lucide-react";

import { VerifyEmailForm } from "@/components/auth";

type VerifyEmailPageProps = {
  searchParams: Promise<{ email?: string }>;
};

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const { email } = await searchParams;

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="bg-brand text-brand-foreground mb-4 flex size-12 items-center justify-center rounded-xl">
          <Mail className="size-6" aria-hidden />
        </div>
        <h1 className="text-foreground text-2xl font-semibold">
          Verify your email
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Enter the 8-character code we sent to your email.
        </p>
      </div>

      <VerifyEmailForm defaultEmail={email ?? ""} />
    </div>
  );
}
