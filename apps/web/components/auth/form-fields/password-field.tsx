type PasswordFieldProps = {
  autoComplete?: "new-password" | "current-password";
  minLength?: number;
};

export function PasswordField({
  autoComplete = "current-password",
  minLength,
}: Readonly<PasswordFieldProps>) {
  return (
    <div className="space-y-2">
      <label htmlFor="password" className="text-foreground text-sm font-medium">
        Password
      </label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete={autoComplete}
        required
        minLength={minLength}
        placeholder="••••••••"
        className="border-input bg-background ring-ring/50 h-10 w-full rounded-lg border px-3 text-sm outline-none focus-visible:ring-3"
      />
    </div>
  );
}
