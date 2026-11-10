"use client";
import { Check, UserPlus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function FollowButton() {
  const [on, setOn] = useState(false);
  return (
    <Button variant={on ? "outline" : "primary"} onClick={() => setOn((x) => !x)} aria-pressed={on}>
      {on ? <Check /> : <UserPlus />}
      {on ? "Following" : "Follow"}
    </Button>
  );
}
