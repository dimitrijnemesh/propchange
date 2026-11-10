export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <main className="flex min-h-[calc(100dvh-32px)] flex-col items-center bg-bg-subtle px-4 py-10 md:py-16">{children}</main>;
}
