import "server-only";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { Connection, Keypair, PublicKey, clusterApiUrl } from "@solana/web3.js";
import config from "./devnet-config.json";

/** Public devnet addresses written by scripts/devnet-setup.mjs. */
export interface DevnetConfig {
  cluster: "devnet";
  escrow: string;
  escrowUsdcAccount: string;
  usdcMint: string;
  tokenProgram: string;
  seat: { slug: string; symbol: string; mint: string; supply: number; priceUsdc: number };
}

export const USDC_DECIMALS = 6;

/** Public devnet addresses (bundled at build time so they are always available on Vercel). */
export function devnetConfig(): DevnetConfig | null {
  return (config as DevnetConfig).seat?.mint ? (config as DevnetConfig) : null;
}

export const connection = () => new Connection(process.env.SOLANA_RPC || clusterApiUrl("devnet"), "confirmed");

/**
 * The escrow keypair. In production it comes from the DEVNET_ESCROW_SECRET env var (JSON byte array); locally it
 * falls back to ~/.config/propchange/devnet-escrow.json. Devnet only — it never holds real funds.
 */
export function escrowKeypair(): Keypair | null {
  try {
    const raw = process.env.DEVNET_ESCROW_SECRET ?? fs.readFileSync(path.join(os.homedir(), ".config", "propchange", "devnet-escrow.json"), "utf8");
    return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(raw)));
  } catch {
    return null;
  }
}

export function parseOwner(v: unknown): PublicKey | null {
  try {
    return typeof v === "string" ? new PublicKey(v) : null;
  } catch {
    return null;
  }
}
