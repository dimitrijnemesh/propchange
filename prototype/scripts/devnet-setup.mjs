// One-off Solana devnet setup for the PropChange demo (Dev3pack 2026).
//
// Creates (or reuses):
//   • the escrow / treasury keypair  → ~/.config/propchange/devnet-escrow.json  (SECRET, never committed)
//   • dUSDC   — a test USDC mint (Token-2022, 6 decimals, with on-chain name/symbol)
//   • ALTCMOME-E9 — the Seat token for "Altcoin Momentum X", Epoch 9 (Token-2022, 0 decimals, supply = 13 Seats)
// and writes the PUBLIC addresses to lib/devnet-config.json.
//
// Usage: node scripts/devnet-setup.mjs
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, clusterApiUrl, sendAndConfirmTransaction } from "@solana/web3.js";
import {
  ExtensionType,
  TOKEN_2022_PROGRAM_ID,
  TYPE_SIZE,
  LENGTH_SIZE,
  createInitializeMetadataPointerInstruction,
  createInitializeMintInstruction,
  getMintLen,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import { createInitializeInstruction, pack } from "@solana/spl-token-metadata";

const SITE = "https://propchange.vercel.app";
const conn = new Connection(process.env.SOLANA_RPC || clusterApiUrl("devnet"), "confirmed");
const secretDir = path.join(os.homedir(), ".config", "propchange");
const secretFile = path.join(secretDir, "devnet-escrow.json");
const outFile = path.join(path.dirname(new URL(import.meta.url).pathname), "..", "lib", "devnet-config.json");

function loadOrCreateKeypair() {
  if (fs.existsSync(secretFile)) return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(secretFile, "utf8"))));
  fs.mkdirSync(secretDir, { recursive: true });
  const kp = Keypair.generate();
  fs.writeFileSync(secretFile, JSON.stringify(Array.from(kp.secretKey)), { mode: 0o600 });
  return kp;
}

async function ensureSol(kp, min = 1) {
  let bal = await conn.getBalance(kp.publicKey);
  console.log("escrow", kp.publicKey.toBase58(), "SOL", bal / LAMPORTS_PER_SOL);
  for (let i = 0; bal < min * LAMPORTS_PER_SOL && i < 3; i++) {
    try {
      const sig = await conn.requestAirdrop(kp.publicKey, 1 * LAMPORTS_PER_SOL);
      await conn.confirmTransaction(sig, "confirmed");
    } catch (e) {
      console.log("airdrop failed:", e.message.slice(0, 120));
      await new Promise((r) => setTimeout(r, 4000));
    }
    bal = await conn.getBalance(kp.publicKey);
    console.log("SOL now", bal / LAMPORTS_PER_SOL);
  }
  if (bal < 0.2 * LAMPORTS_PER_SOL) throw new Error("Not enough devnet SOL — fund " + kp.publicKey.toBase58() + " at https://faucet.solana.com and re-run.");
}

async function createMintWithMetadata(payer, { name, symbol, uri, decimals }) {
  const mint = Keypair.generate();
  const metadata = { mint: mint.publicKey, name, symbol, uri, additionalMetadata: [] };
  const mintLen = getMintLen([ExtensionType.MetadataPointer]);
  const metaLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;
  const lamports = await conn.getMinimumBalanceForRentExemption(mintLen + metaLen);
  const tx = new Transaction().add(
    SystemProgram.createAccount({ fromPubkey: payer.publicKey, newAccountPubkey: mint.publicKey, space: mintLen, lamports, programId: TOKEN_2022_PROGRAM_ID }),
    createInitializeMetadataPointerInstruction(mint.publicKey, payer.publicKey, mint.publicKey, TOKEN_2022_PROGRAM_ID),
    createInitializeMintInstruction(mint.publicKey, decimals, payer.publicKey, null, TOKEN_2022_PROGRAM_ID),
    createInitializeInstruction({
      programId: TOKEN_2022_PROGRAM_ID,
      metadata: mint.publicKey,
      updateAuthority: payer.publicKey,
      mint: mint.publicKey,
      mintAuthority: payer.publicKey,
      name,
      symbol,
      uri,
    }),
  );
  const sig = await sendAndConfirmTransaction(conn, tx, [payer, mint]);
  console.log("mint", symbol, mint.publicKey.toBase58(), sig);
  return mint.publicKey;
}

const existing = fs.existsSync(outFile) ? JSON.parse(fs.readFileSync(outFile, "utf8")) : null;
const escrow = loadOrCreateKeypair();
await ensureSol(escrow, 1);

let usdcMint = existing?.usdcMint ? new PublicKey(existing.usdcMint) : null;
if (!usdcMint) usdcMint = await createMintWithMetadata(escrow, { name: "PropChange Test USDC", symbol: "dUSDC", uri: `${SITE}/token/dusdc.json`, decimals: 6 });

let seatMint = existing?.seat?.mint ? new PublicKey(existing.seat.mint) : null;
const SEATS = 13;
if (!seatMint) {
  seatMint = await createMintWithMetadata(escrow, { name: "Seat · Altcoin Momentum X · Epoch 9", symbol: "ALTCMOME-E9", uri: `${SITE}/token/altcmome-e9.json`, decimals: 0 });
  const ata = await getOrCreateAssociatedTokenAccount(conn, escrow, seatMint, escrow.publicKey, false, "confirmed", undefined, TOKEN_2022_PROGRAM_ID);
  const sig = await mintTo(conn, escrow, seatMint, ata.address, escrow, SEATS, [], undefined, TOKEN_2022_PROGRAM_ID);
  console.log("minted", SEATS, "Seats to escrow", sig);
}
// escrow's USDC account (receives Seat fees, pays refunds)
const escrowUsdc = await getOrCreateAssociatedTokenAccount(conn, escrow, usdcMint, escrow.publicKey, false, "confirmed", undefined, TOKEN_2022_PROGRAM_ID);

const config = {
  cluster: "devnet",
  escrow: escrow.publicKey.toBase58(),
  escrowUsdcAccount: escrowUsdc.address.toBase58(),
  usdcMint: usdcMint.toBase58(),
  tokenProgram: TOKEN_2022_PROGRAM_ID.toBase58(),
  seat: { slug: "alt-momentum-x", symbol: "ALTCMOME-E9", mint: seatMint.toBase58(), supply: SEATS, priceUsdc: 81.48 },
};
fs.writeFileSync(outFile, JSON.stringify(config, null, 2) + "\n");
console.log("wrote", outFile, config);
