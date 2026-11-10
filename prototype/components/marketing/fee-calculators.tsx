"use client";
import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Pills } from "@/components/ui/tabs";
import { Label } from "@/components/ui/input";
import { fmtMoney, fmtNumber } from "@/lib/format";
import { FEE_SPLIT, TERMS, occupancyFactor, seatPrice, termFactor } from "@/lib/pricing";

export function FollowerCalculator() {
  const [base, setBase] = useState(30);
  const [term, setTerm] = useState(30);
  const [occ, setOcc] = useState(84);
  const price = seatPrice(base, term, occ / 100);
  return (
    <div className="grid gap-6 md:grid-cols-[1fr_280px]">
      <div className="space-y-6">
        <div>
          <Label>Base price (trader-set)</Label>
          <Slider label="Base price" value={base} onChange={setBase} min={5} max={100} format={(v) => `${v} USDC`} />
        </div>
        <div>
          <Label>Occupancy</Label>
          <Slider label="Occupancy" value={occ} onChange={setOcc} min={0} max={100} format={(v) => `${v}%`} />
        </div>
        <div>
          <Label>Term</Label>
          <Pills ariaLabel="Term" options={TERMS.map((t) => ({ value: t, label: `${t} days` }))} value={term} onChange={setTerm} />
        </div>
      </div>
      <div className="rounded-lg bg-bg-subtle p-5">
        <div className="text-caption text-secondary">Seat price</div>
        <div className="tnum mt-1 text-[36px] font-bold leading-[44px]">{fmtNumber(price)}</div>
        <div className="text-caption text-tertiary">USDC for {term} days · {fmtNumber(price / (term / 30))} per 30d</div>
        <dl className="tnum mt-5 space-y-1.5 border-t border-border pt-4 text-[13px]">
          <div className="flex justify-between"><dt className="text-secondary">Base</dt><dd>{base.toFixed(2)}</dd></div>
          <div className="flex justify-between"><dt className="text-secondary">× term factor</dt><dd>{termFactor(term).toFixed(3)}</dd></div>
          <div className="flex justify-between"><dt className="text-secondary">× occupancy factor</dt><dd>{occupancyFactor(occ / 100).toFixed(3)}</dd></div>
        </dl>
      </div>
    </div>
  );
}

export function TraderCalculator() {
  const [seats, setSeats] = useState(100);
  const [price, setPrice] = useState(30);
  const [ret, setRet] = useState(3);
  const [perf, setPerf] = useState(true);
  const [resales, setResales] = useState(10);
  const alloc = 3000;
  const seatGross = seats * price;
  const perfGross = perf ? seats * alloc * (ret / 100) * 0.15 : 0;
  const royalty = resales * 200 * 0.05;
  const traderTotal = seatGross * FEE_SPLIT.trader + perfGross * FEE_SPLIT.trader + royalty;
  const platform = seatGross * FEE_SPLIT.platform + perfGross * FEE_SPLIT.platform;
  const rows = [
    ["Seat Fees", seatGross, seatGross * FEE_SPLIT.trader, seatGross * FEE_SPLIT.platform],
    ["Performance fee 15%", perfGross, perfGross * FEE_SPLIT.trader, perfGross * FEE_SPLIT.platform],
    ["Resale royalty 5%", royalty, royalty, 0],
  ] as const;
  return (
    <div className="grid gap-6 md:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <div>
          <Label>Seats filled ($3,000 allocation each)</Label>
          <Slider label="Seats" value={seats} onChange={setSeats} min={5} max={300} format={(v) => `${v}`} />
        </div>
        <div>
          <Label>Seat price per Epoch</Label>
          <Slider label="Seat price" value={price} onChange={setPrice} min={5} max={100} format={(v) => `${v} USDC`} />
        </div>
        <div>
          <Label>Epoch return</Label>
          <Slider label="Epoch return" value={ret} onChange={setRet} min={-5} max={15} step={0.5} format={(v) => `${v}%`} />
        </div>
        <div>
          <Label>Seats resold this Epoch (at 200 USDC)</Label>
          <Slider label="Resales" value={resales} onChange={setResales} min={0} max={40} format={(v) => `${v}`} />
        </div>
        <label className="flex items-center justify-between rounded-md bg-bg-subtle p-4">
          <span>
            <span className="block font-semibold">Performance fee add-on (15%)</span>
            <span className="text-caption text-secondary">Only on new profit above each follower&apos;s high-water mark</span>
          </span>
          <Switch checked={perf} onCheckedChange={setPerf} label="Performance fee" />
        </label>
      </div>
      <div className="rounded-lg border border-border">
        <table className="tnum w-full text-right text-[13px]">
          <thead className="bg-bg-subtle text-caption text-secondary">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Source</th>
              <th className="px-3 py-2 font-medium">Gross</th>
              <th className="px-3 py-2 font-medium">You</th>
              <th className="px-3 py-2 font-medium">Platform</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map(([l, g, t, p]) => (
              <tr key={l}>
                <td className="px-3 py-2.5 text-left text-secondary">{l}</td>
                <td className="px-3 py-2.5">{fmtNumber(g, 0)}</td>
                <td className="px-3 py-2.5 font-semibold">{fmtNumber(t, 0)}</td>
                <td className="px-3 py-2.5">{fmtNumber(p, 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t border-border bg-bg-subtle p-4">
          <div className="text-caption text-secondary">Your income per kept Epoch</div>
          <div className="tnum text-[30px] font-bold leading-9 text-primary-text">{fmtMoney(traderTotal, { currency: "USDC", digits: 0 })}</div>
          <div className="tnum text-caption text-tertiary">Platform {fmtMoney(platform, { currency: "USDC", digits: 0 })} · Hard breach → 0 for that Epoch</div>
        </div>
      </div>
    </div>
  );
}
