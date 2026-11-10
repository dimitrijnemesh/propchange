"use client";
import { AlertTriangle } from "lucide-react";
import { EmptyState } from "@/components/common";
import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[60dvh] items-center justify-center">
      <EmptyState
        icon={<AlertTriangle />}
        title="Something went wrong"
        body="We couldn't load this page. Please try again."
        action={<Button onClick={reset}>Retry</Button>}
      />
    </div>
  );
}
