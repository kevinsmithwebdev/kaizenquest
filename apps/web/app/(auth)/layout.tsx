export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-background flex min-h-full items-center justify-center px-6 py-16">
      {children}
    </div>
  );
}
