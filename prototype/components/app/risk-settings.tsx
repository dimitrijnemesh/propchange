"use client";
import { OctagonX, Save } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input, Label } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Pills } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";

const presets = {
  conservative: { loss: 10, daily: 3, lev: 3, pos: 15 },
  balanced: { loss: 20, daily: 5, lev: 5, pos: 25 },
  aggressive: { loss: 35, daily: 8, lev: 8, pos: 40 },
};

export function RiskSettings({ seats }: { seats: { id: string; name: string; allocation: number; contractLev: number }[] }) {
  const toast = useToast();
  const [profile, setProfile] = useState<keyof typeof presets | "custom">("balanced");
  const [v, setV] = useState(presets.balanced);
  const [floor, setFloor] = useState("5000");
  const [closeOnLimit, setCloseOnLimit] = useState(true);
  const [killOpen, setKillOpen] = useState(false);
  const [killed, setKilled] = useState(false);
  const [overrides, setOverrides] = useState<Record<string, number>>({});
  const upd = (k: keyof typeof v) => (x: number) => {
    setV((s) => ({ ...s, [k]: x }));
    setProfile("custom");
  };
  return (
    <div className="space-y-6">
      <Card className={killed ? "border-danger" : ""}>
        <CardBody className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-h3">Kill switch</h2>
            <p className="text-secondary">{killed ? "All copying is stopped. No new orders will be placed in your accounts." : "Stop all copying into all your accounts immediately."}</p>
          </div>
          {killed ? (
            <Button variant="outline" onClick={() => (setKilled(false), toast({ kind: "success", title: "Copying resumed" }))}>
              Resume copying
            </Button>
          ) : (
            <Button variant="danger" size="lg" onClick={() => setKillOpen(true)}>
              <OctagonX /> Stop all copying
            </Button>
          )}
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Default limits" description="Applied to every new Seat. Platform bounds apply." />
        <CardBody className="space-y-7">
          <div>
            <Label>Profile</Label>
            <Pills
              ariaLabel="Risk profile"
              value={profile}
              onChange={(p) => {
                setProfile(p);
                if (p !== "custom") setV(presets[p]);
              }}
              options={[
                { value: "conservative", label: "Conservative" },
                { value: "balanced", label: "Balanced" },
                { value: "aggressive", label: "Aggressive" },
                { value: "custom", label: "Custom" },
              ]}
            />
          </div>
          <div className="grid gap-x-10 gap-y-7 md:grid-cols-2">
            <div>
              <Label>Max loss on allocation</Label>
              <Slider label="Max loss on allocation" value={v.loss} onChange={upd("loss")} min={5} max={50} format={(x) => `${x}%`} />
            </div>
            <div>
              <Label>Daily loss limit</Label>
              <Slider label="Daily loss limit" value={v.daily} onChange={upd("daily")} min={1} max={15} format={(x) => `${x}%`} />
            </div>
            <div>
              <Label>Max leverage (never above the strategy&apos;s contract)</Label>
              <Slider label="Max leverage" value={v.lev} onChange={upd("lev")} min={1} max={10} step={0.5} format={(x) => `${x}x`} />
            </div>
            <div>
              <Label>Max single position, % of equity</Label>
              <Slider label="Max position" value={v.pos} onChange={upd("pos")} min={5} max={60} format={(x) => `${x}%`} />
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Label htmlFor="floor">Account equity floor</Label>
              <Input id="floor" inputMode="decimal" value={floor} onChange={(e) => setFloor(e.target.value.replace(/[^\d.]/g, ""))} suffix="USD" />
              <p className="mt-1 text-caption text-tertiary">If any account falls below this, copying stops on that account.</p>
            </div>
            <label className="flex items-center justify-between gap-4 rounded-md bg-bg-subtle p-4">
              <span>
                <span className="block font-semibold">Close copied positions when a limit is hit</span>
                <span className="text-caption text-secondary">Otherwise copying stops and positions stay open.</span>
              </span>
              <Switch checked={closeOnLimit} onCheckedChange={setCloseOnLimit} label="Close on limit" />
            </label>
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Per-Seat overrides" description="Tighten the max loss for an individual Seat." />
        <CardBody className="divide-y divide-border py-0">
          {seats.map((s) => (
            <div key={s.id} className="grid items-center gap-4 py-5 md:grid-cols-[220px_1fr]">
              <div>
                <div className="font-semibold">{s.name}</div>
                <div className="text-caption text-tertiary">
                  Allocation ${s.allocation.toLocaleString("en-US")} · contract leverage {s.contractLev}x
                </div>
              </div>
              <Slider
                label={`Max loss for ${s.name}`}
                value={overrides[s.id] ?? v.loss}
                onChange={(x) => setOverrides((o) => ({ ...o, [s.id]: x }))}
                min={5}
                max={v.loss}
                format={(x) => `${x}% · $${Math.round((s.allocation * x) / 100).toLocaleString("en-US")}`}
              />
            </div>
          ))}
        </CardBody>
      </Card>
      <div className="flex justify-end">
        <Button size="lg" onClick={() => toast({ kind: "success", title: "Risk limits saved", body: "Applied to the next copied order." })}>
          <Save /> Save limits
        </Button>
      </div>
      <Dialog open={killOpen} onOpenChange={setKillOpen}>
        <DialogContent title="Stop all copying?">
          <div className="space-y-4 p-5">
            <p className="text-secondary">No new orders will be copied into any of your accounts. Your Seats and escrow are not affected.</p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setKillOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  setKilled(true);
                  setKillOpen(false);
                  toast({ kind: "danger", title: "All copying stopped" });
                }}
              >
                Stop all copying
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
