"use client";
import { useState } from "react";
import { RiskEngineLog } from "@/components/risk/risk-engine-log";
import { Pills } from "@/components/ui/tabs";
import type { RiskLogEntry } from "@/types/domain";

export function ActivityLog({ entries }: { entries: (RiskLogEntry & { strategyName: string })[] }) {
  const [lvl, setLvl] = useState<"all" | RiskLogEntry["level"]>("all");
  const [n, setN] = useState(15);
  const list = entries.filter((e) => lvl === "all" || e.level === lvl);
  return (
    <div>
      <Pills
        ariaLabel="Filter"
        value={lvl}
        onChange={setLvl}
        options={[
          { value: "all", label: `All · ${entries.length}` },
          { value: "info", label: "Info" },
          { value: "warning", label: "Warnings" },
          { value: "danger", label: "Stops" },
        ]}
        className="mb-5"
      />
      <div className="rounded-lg border border-border bg-surface p-5">
        <RiskEngineLog entries={list.slice(0, n)} />
        {n < list.length ? (
          <button onClick={() => setN((x) => x + 15)} className="mt-4 w-full rounded-md bg-bg-subtle py-2.5 font-semibold text-secondary hover:text-text">
            Load more
          </button>
        ) : null}
      </div>
    </div>
  );
}
