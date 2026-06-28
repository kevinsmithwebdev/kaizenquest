export function NameField() {
  return (
    <div className="space-y-2">
      <label htmlFor="name" className="text-foreground text-sm font-medium">
        Name
      </label>
      <input
        id="name"
        name="name"
        type="text"
        autoComplete="name"
        required
        placeholder="Your name"
        className="border-input bg-background ring-ring/50 h-10 w-full rounded-lg border px-3 text-sm outline-none focus-visible:ring-3"
      />
    </div>
  );
}
