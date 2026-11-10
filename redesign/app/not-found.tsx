import Link from "next/link";
import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/common";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-[70dvh] items-center justify-center">
      <EmptyState
        icon={<SearchX />}
        title="Page not found"
        body="This page does not exist or has moved."
        action={
          <Link href="/" className={buttonVariants()}>
            Back to home
          </Link>
        }
      />
    </main>
  );
}
