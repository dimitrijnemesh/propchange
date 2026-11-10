"use client";
import { Command } from "cmdk";
import { BarChart3, Clock, Coins, Flame, Search, ShieldCheck, User, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/common";
import { fmtNumber, fmtPct } from "@/lib/format";
import type { MessageKey } from "@/lib/i18n/messages";
import type { SearchData, SearchItem } from "@/lib/search-types";
import { cn } from "@/lib/utils";
import { useT } from "./i18n-provider";

/** Precise matching (no fuzzy letter-skipping): earlier matches rank higher. */
function substringFilter(value: string, search: string) {
  const i = value.toLowerCase().indexOf(search.trim().toLowerCase());
  return i < 0 ? 0 : 1 - Math.min(i, 50) / 100;
}

/** Session-only recent searches, shared by both search instances. */
let recentStore: SearchItem[] = [];

function highlight(text: string, q: string) {
  if (!q) return text;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark className="bg-transparent font-bold text-primary-text">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

const groupCls =
  "[&_[cmdk-group-heading]]:flex [&_[cmdk-group-heading]]:items-center [&_[cmdk-group-heading]]:gap-1.5 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:text-caption [&_[cmdk-group-heading]]:text-tertiary";
const itemCls =
  "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition-colors duration-100 data-[selected=true]:bg-primary-soft";

function StrategyRow({ s, q, rank }: { s: SearchItem; q: string; rank?: number }) {
  const t = useT();
  return (
    <>
      {rank ? (
        <span className={cn("tnum w-4 shrink-0 text-center text-[13px] font-bold", rank <= 3 ? "text-primary-text" : "text-tertiary")}>{rank}</span>
      ) : null}
      <Avatar name={s.trader ?? s.label} size={30} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14px] font-semibold text-text">{highlight(s.label, q)}</div>
        <div className="truncate text-[12px] text-tertiary">{highlight(s.sub, q)}</div>
      </div>
      {s.price !== undefined ? (
        <div className="shrink-0 text-right">
          <div className="tnum text-[14px] font-semibold text-text">{fmtNumber(s.price)}</div>
          <div className="flex items-center justify-end gap-1.5">
            <span className="text-[11px] text-tertiary">{t("search.perSeat")}</span>
            <span className={cn("tnum text-[12px] font-semibold", (s.change ?? 0) >= 0 ? "text-up" : "text-down")}>
              {fmtPct(s.change ?? 0, { sign: true })}
            </span>
          </div>
        </div>
      ) : null}
    </>
  );
}

/**
 * Exchange-style search: a field in the navbar (wide screens) or a search icon (smaller screens)
 * that drops a panel down beneath it — hot seats, markets, top traders and recent searches when
 * empty; grouped, highlighted results while typing. "/" or ⌘K focuses it; arrows + Enter navigate.
 */
/* Search index: fetched once per page session, on first hover/focus/open. */
let indexCache: SearchData | null = null;
let indexPromise: Promise<SearchData> | null = null;
function loadIndex() {
  indexPromise ??= fetch("/api/search")
    .then((r) => r.json() as Promise<SearchData>)
    .then((d) => (indexCache = d))
    .catch((e) => {
      indexPromise = null;
      throw e;
    });
  return indexPromise;
}
const EMPTY: SearchData = { items: [], hot: [], markets: [], topTraders: [] };

function useSearchIndex() {
  const [data, setData] = useState<SearchData | null>(indexCache);
  const warm = () => {
    if (indexCache) return setData(indexCache);
    loadIndex().then(setData, () => undefined);
  };
  return { data, warm };
}

export function NavSearch({ variant }: { variant: "field" | "icon" }) {
  const { data: loaded, warm } = useSearchIndex();
  const data = loaded ?? EMPTY;
  const t = useT();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [recent, setRecent] = useState<SearchItem[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const close = () => {
    setOpen(false);
    setQ("");
    inputRef.current?.blur();
  };

  // Global shortcuts: "/" and ⌘K / Ctrl+K open whichever instance is visible.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!rootRef.current || rootRef.current.offsetParent === null) return;
      const typing = /input|textarea|select/i.test((e.target as HTMLElement)?.tagName ?? "");
      if ((e.key === "/" && !typing) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) {
        e.preventDefault();
        warm();
        setRecent(recentStore);
        setOpen(true);
        requestAnimationFrame(() => inputRef.current?.focus());
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (open) warm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const pick = (item: SearchItem) => {
    recentStore = [item, ...recentStore.filter((r) => r.href !== item.href)].slice(0, 5);
    setRecent(recentStore);
    close();
    router.push(item.href);
  };

  const go = (href: string) => {
    close();
    router.push(href);
  };

  const strategies = data.items.filter((i) => i.type === "strategy");
  const traders = data.items.filter((i) => i.type === "trader");
  const instruments = data.items.filter((i) => i.type === "instrument");

  const input = (
    <Command.Input
      ref={inputRef}
      value={q}
      onValueChange={(v) => {
        setQ(v);
        setOpen(true);
      }}
      onFocus={() => {
        setRecent(recentStore);
        setOpen(true);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          close();
        }
      }}
      placeholder={t("nav.search")}
      aria-label={t("nav.search")}
      className="h-full min-w-0 flex-1 bg-transparent text-[14px] text-text outline-none placeholder:text-tertiary focus-visible:shadow-none dark:placeholder:text-white/60"
    />
  );

  const panel = (
    <div
      className={cn(
        "nav-search-panel anim-palette z-50 overflow-hidden rounded-xl border border-border font-sans",
        variant === "field"
          ? "absolute right-0 top-full mt-2 w-[min(460px,calc(100vw-32px))]"
          : "fixed inset-x-3 top-[64px] md:absolute md:inset-x-auto md:right-0 md:top-full md:mt-2 md:w-[440px]",
      )}
    >
      {variant === "icon" ? (
        <div className="flex items-center gap-3 border-b border-border px-3 py-2.5">
          <div className="flex h-10 flex-1 items-center gap-2 rounded-lg border border-border-strong bg-bg-subtle px-3 focus-within:border-primary">
            <Search className="size-4 shrink-0 text-tertiary" strokeWidth={1.75} />
            {input}
            {q ? (
              <button type="button" aria-label="Clear" onClick={() => setQ("")} className="text-tertiary hover:text-text">
                <X className="size-4" />
              </button>
            ) : null}
          </div>
          <button type="button" onClick={close} className="text-[14px] font-semibold text-primary-text hover:underline">
            {t("search.cancel")}
          </button>
        </div>
      ) : null}

      <Command.List className="scroll-thin max-h-[min(70vh,540px)] overflow-y-auto p-1.5">
        {!loaded ? (
          <Command.Loading>
            <div className="space-y-2 p-3" aria-label="Loading">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-9 rounded-lg" />
              ))}
            </div>
          </Command.Loading>
        ) : (
          <Command.Empty className="px-3 py-10 text-center text-secondary">
            {t("search.noResults")} “{q}”
          </Command.Empty>
        )}

        {!q ? (
          <>
            {recent.length ? (
              <Command.Group heading={t("search.recent")} className={groupCls}>
                {recent.map((r) => (
                  <Command.Item key={"r" + r.href} value={"recent " + r.href} onSelect={() => pick(r)} className={itemCls}>
                    <Clock className="size-4 shrink-0 text-tertiary" strokeWidth={1.75} />
                    <span className="flex-1 truncate text-[14px] font-medium text-text">{r.label}</span>
                    <span className="truncate text-[12px] text-tertiary">{r.sub}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            ) : null}

            <Command.Group
              heading={
                (
                  <>
                    <Flame className="size-3.5 text-primary-text" strokeWidth={2} /> {t("search.hot")}
                  </>
                )
              }
              className={groupCls}
            >
              {data.hot.map((s, i) => (
                <Command.Item key={"h" + s.href} value={"hot " + s.href} onSelect={() => pick(s)} className={itemCls}>
                  <StrategyRow s={s} q="" rank={i + 1} />
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group heading={t("search.markets")} className={groupCls}>
              <div className="grid grid-cols-2 gap-1.5 px-1.5 pb-1">
                {data.markets.map((m) => (
                  <Command.Item
                    key={m.key}
                    value={"market " + m.key}
                    onSelect={() => go(`/strategies?market=${m.key}`)}
                    className="flex cursor-pointer items-center justify-between rounded-lg border border-border px-3 py-2.5 text-[14px] font-semibold text-text transition-colors data-[selected=true]:border-primary/40 data-[selected=true]:bg-primary-soft"
                  >
                    {t(`market.${m.key}` as MessageKey)}
                    <span className="tnum rounded-full bg-bg-muted px-2 text-[12px] font-semibold text-secondary">{m.count}</span>
                  </Command.Item>
                ))}
              </div>
            </Command.Group>

            <Command.Group heading={t("search.topTraders")} className={groupCls}>
              {data.topTraders.map((tr) => (
                <Command.Item key={tr.handle} value={"trader " + tr.handle} onSelect={() => go(`/traders/${tr.handle}`)} className={itemCls}>
                  <Avatar name={tr.handle} size={30} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14px] font-semibold text-text">{tr.handle}</div>
                    <div className="truncate text-[12px] text-tertiary">{tr.name}</div>
                  </div>
                  <span className="tnum inline-flex items-center gap-1 rounded-sm bg-success-soft px-2 py-0.5 text-[12px] font-semibold text-success">
                    <ShieldCheck className="size-3.5" strokeWidth={2} />
                    {tr.kept}/{tr.settled}
                  </span>
                </Command.Item>
              ))}
            </Command.Group>
          </>
        ) : (
          <>
            <Command.Group
              heading={
                (
                  <>
                    <BarChart3 className="size-3.5" strokeWidth={2} /> {t("search.strategies")}
                  </>
                )
              }
              className={groupCls}
            >
              {strategies.map((s) => (
                <Command.Item key={s.href} value={`${s.label} ${s.sub} strategy`} onSelect={() => pick(s)} className={itemCls}>
                  <StrategyRow s={s} q={q} />
                </Command.Item>
              ))}
            </Command.Group>
            <Command.Group
              heading={
                (
                  <>
                    <User className="size-3.5" strokeWidth={2} /> {t("search.traders")}
                  </>
                )
              }
              className={groupCls}
            >
              {traders.map((s) => (
                <Command.Item key={s.href} value={`${s.label} ${s.sub} trader`} onSelect={() => pick(s)} className={itemCls}>
                  <Avatar name={s.label} size={30} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14px] font-semibold text-text">{highlight(s.label, q)}</div>
                    <div className="truncate text-[12px] text-tertiary">{highlight(s.sub, q)}</div>
                  </div>
                </Command.Item>
              ))}
            </Command.Group>
            <Command.Group
              heading={
                (
                  <>
                    <Coins className="size-3.5" strokeWidth={2} /> {t("search.instruments")}
                  </>
                )
              }
              className={groupCls}
            >
              {instruments.map((s) => (
                <Command.Item key={s.href} value={`${s.label} instrument`} onSelect={() => pick(s)} className={itemCls}>
                  <span className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-bg-muted text-[10px] font-bold text-secondary">
                    {s.label.slice(0, 3)}
                  </span>
                  <span className="flex-1 text-[14px] font-semibold text-text">{highlight(s.label, q)}</span>
                  <span className="tnum text-[12px] text-tertiary">
                    {s.sub} {t("nav.strategies").toLowerCase()}
                  </span>
                </Command.Item>
              ))}
            </Command.Group>
          </>
        )}
      </Command.List>

      <div className="hidden items-center justify-between border-t border-border px-4 py-2 text-[12px] text-tertiary md:flex">
        <span className="flex items-center gap-1.5">
          <kbd className="rounded-sm border border-border-strong bg-bg-subtle px-1.5 font-sans text-[11px]">/</kbd>
          <kbd className="rounded-sm border border-border-strong bg-bg-subtle px-1.5 font-sans text-[11px]">⌘K</kbd>
          {t("search.hint")}
        </span>
        <span className="flex items-center gap-1.5">
          <kbd className="rounded-sm border border-border-strong bg-bg-subtle px-1.5 font-sans text-[11px]">↑↓</kbd>
          <kbd className="rounded-sm border border-border-strong bg-bg-subtle px-1.5 font-sans text-[11px]">↵</kbd>
          <kbd className="rounded-sm border border-border-strong bg-bg-subtle px-1.5 font-sans text-[11px]">esc</kbd>
        </span>
      </div>
    </div>
  );

  return (
    <div ref={rootRef} onPointerEnter={warm} onFocus={warm} className={cn("relative", variant === "field" && "w-full")}>
      <Command shouldFilter={!!q} filter={substringFilter} loop label={t("nav.search")} className="contents">
        {variant === "field" ? (
          <div
            className={cn(
              "nav-search-field flex h-10 w-full items-center gap-2 rounded-lg border px-3 transition-[border-color,background-color,box-shadow] duration-150",
              open ? "border-primary/50 shadow-[0_0_0_3px_var(--focus-ring)]" : "border-transparent",
            )}
          >
            <Search className="size-4 shrink-0 text-tertiary dark:text-white/70" strokeWidth={1.75} />
            {input}
            {!open ? (
              <kbd className="hidden rounded-sm border border-border-strong bg-surface px-1.5 font-sans text-[11px] text-tertiary sm:block dark:border-white/25 dark:bg-white/10 dark:text-white/80">
                /
              </kbd>
            ) : q ? (
              <button type="button" aria-label="Clear" onClick={() => setQ("")} className="text-tertiary hover:text-text">
                <X className="size-4" />
              </button>
            ) : null}
          </div>
        ) : (
          <button
            type="button"
            aria-label={t("nav.search")}
            aria-expanded={open}
            onClick={() => {
              setRecent(recentStore);
              setOpen((o) => !o);
              requestAnimationFrame(() => inputRef.current?.focus());
            }}
            className={cn(
              "inline-flex size-9 items-center justify-center rounded-md text-text transition-colors hover:bg-bg-muted dark:text-white dark:hover:bg-white/10",
              open && "bg-bg-muted dark:bg-white/10",
            )}
          >
            <Search className="size-[18px]" strokeWidth={1.75} />
          </button>
        )}
        {open ? panel : null}
      </Command>
    </div>
  );
}
