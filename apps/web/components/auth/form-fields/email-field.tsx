export function EmailField() {
  return (
    <div className="space-y-2">
      <label htmlFor="email" className="text-foreground text-sm font-medium">
        Email
      </label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        required
        placeholder="you@example.com"
        className="border-input bg-background ring-ring/50 h-10 w-full rounded-lg border px-3 text-sm outline-none focus-visible:ring-3"
      />
    </div>
  );
}
