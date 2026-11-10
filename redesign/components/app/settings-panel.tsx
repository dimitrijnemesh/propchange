"use client";
import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useApp } from "@/components/layout/providers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export function SettingsPanel() {
  const { theme, setTheme } = useTheme();
  const app = useApp();
  const toast = useToast();
  const [mounted, setMounted] = useState(false);
  const [notif, setNotif] = useState({ breach: true, settlement: true, risk: true, marketing: false });
  useEffect(() => setMounted(true), []);
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Profile" />
        <CardBody className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="pname">Display name</Label>
            <Input id="pname" defaultValue="Sam Rivera" />
          </div>
          <div>
            <Label htmlFor="pemail">Email</Label>
            <Input id="pemail" type="email" defaultValue="sam@example.com" />
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Appearance" />
        <CardBody className="space-y-6">
          <div>
            <Label>Theme</Label>
            <div className="grid max-w-md grid-cols-3 gap-2" role="radiogroup" aria-label="Theme">
              {[
                { v: "light", label: "Light", I: Sun },
                { v: "dark", label: "Dark", I: Moon },
                { v: "system", label: "System", I: Laptop },
              ].map(({ v, label, I }) => {
                const on = mounted && theme === v;
                return (
                  <button
                    key={v}
                    role="radio"
                    aria-checked={on}
                    onClick={() => setTheme(v)}
                    className={cn("flex flex-col items-center gap-2 rounded-lg border p-4 text-[13px] font-semibold", on ? "border-primary bg-primary-soft text-primary-soft-text" : "border-border hover:border-border-strong")}
                  >
                    <I className="size-5" strokeWidth={1.75} /> {label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-semibold">Swap gain / loss colors</div>
              <div className="text-caption text-secondary">Dark mode: red up / green down, common in East Asian markets.</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[13px]">
                <span className="text-up">+2.41%</span> / <span className="text-down">−1.12%</span>
              </span>
              <Switch checked={app.redUp} onCheckedChange={app.setRedUp} label="Red up / green down" />
            </div>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-semibold">Language</div>
              <div className="text-caption text-secondary">13 languages available.</div>
            </div>
            <Badge variant="neutral">English</Badge>
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Notifications" />
        <CardBody className="divide-y divide-border py-0">
          {(
            [
              ["breach", "Contract breaches & refunds", "Always recommended"],
              ["settlement", "Epoch settlements", "When fees are released or refunded"],
              ["risk", "Risk Engine actions", "Stops, pauses, throttles"],
              ["marketing", "Product updates", "Occasional emails"],
            ] as const
          ).map(([k, t, d]) => (
            <div key={k} className="flex items-center justify-between gap-4 py-4">
              <div>
                <div className="font-semibold">{t}</div>
                <div className="text-caption text-secondary">{d}</div>
              </div>
              <Switch checked={notif[k]} onCheckedChange={(v) => setNotif((n) => ({ ...n, [k]: v }))} label={t} />
            </div>
          ))}
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Security" />
        <CardBody className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="font-semibold">Two-factor authentication</div>
            <div className="text-caption text-secondary">Required for traders.</div>
          </div>
          <Badge variant="success">Enabled</Badge>
        </CardBody>
      </Card>
      <div className="flex justify-end">
        <Button size="lg" onClick={() => toast({ kind: "success", title: "Settings saved" })}>
          Save changes
        </Button>
      </div>
    </div>
  );
}
