"use client";
import { AlertTriangle, CheckCircle2, KeyRound, Plus, Trash2, XCircle } from "lucide-react";
import { useState } from "react";
import { ConnectAccountForm } from "@/components/seat/buy-seat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { fmtDate, fmtMoney } from "@/lib/format";
import type { ExchangeAccount } from "@/types/domain";

function Check({ ok, label, warn }: { ok: boolean; label: string; warn?: boolean }) {
  const I = ok ? CheckCircle2 : warn ? AlertTriangle : XCircle;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[13px] ${ok ? "text-success" : warn ? "text-warning" : "text-danger"}`}>
      <I className="size-4" /> {label}
    </span>
  );
}

export function Connections({ initial }: { initial: ExchangeAccount[] }) {
  const [list, setList] = useState(initial);
  const [adding, setAdding] = useState(false);
  const toast = useToast();
  return (
    <div className="space-y-4">
      {list.map((a) => (
        <Card key={a.id} className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-semibold">{a.label}</span>
                <Badge variant="outline">{a.venue}</Badge>
              </div>
              <div className="tnum mt-0.5 text-caption text-tertiary">
                Equity {fmtMoney(a.equityUsd)} · connected {fmtDate(a.connectedAt)}
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => toast({ kind: "info", title: "Key rotation", body: "Paste a new trade-only key to replace the current one (mock)." })}>
                <KeyRound /> Rotate key
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-danger"
                onClick={() => {
                  setList((l) => l.filter((x) => x.id !== a.id));
                  toast({ kind: "success", title: "Connection revoked", body: a.label });
                }}
              >
                <Trash2 /> Revoke
              </Button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-border pt-4">
            <Check ok={a.permissions.trade} label="Trade permission" />
            <Check ok={!a.permissions.withdraw} label="Withdrawal disabled" />
            <Check ok={a.permissions.ipWhitelist} warn label={a.permissions.ipWhitelist ? "IP whitelist" : "IP whitelist not set (recommended)"} />
          </div>
        </Card>
      ))}
      {adding ? (
        <ConnectAccountForm
          onCancel={() => setAdding(false)}
          onConnected={(acc) => {
            setList((l) => [...l, acc]);
            setAdding(false);
            toast({ kind: "success", title: "Account connected", body: acc.label });
          }}
        />
      ) : (
        <Button variant="outline" size="lg" className="w-full border-dashed" onClick={() => setAdding(true)}>
          <Plus /> Connect exchange or broker
        </Button>
      )}
    </div>
  );
}
