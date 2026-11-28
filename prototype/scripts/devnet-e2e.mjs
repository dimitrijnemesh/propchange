// End-to-end check of /api/devnet with a throwaway buyer wallet: faucet → buy → refund.
// Usage: node scripts/devnet-e2e.mjs [baseUrl]   (default http://localhost:3100)
import { Connection, Keypair, Transaction, clusterApiUrl } from "@solana/web3.js";

const base = process.argv[2] || "http://localhost:3100";
const conn = new Connection(clusterApiUrl("devnet"), "confirmed");
const buyer = Keypair.generate();
const owner = buyer.publicKey.toBase58();
const state = async () => (await fetch(`${base}/api/devnet?owner=${owner}`)).json();
const post = async (action) => {
  const r = await fetch(`${base}/api/devnet`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action, owner }) });
  const j = await r.json();
  if (!r.ok) throw new Error(`${action}: ${j.error}`);
  if (j.signature) return j.signature;
  const tx = Transaction.from(Buffer.from(j.transaction, "base64"));
  tx.partialSign(buyer); // the "wallet" signature
  const sig = await conn.sendRawTransaction(tx.serialize());
  await conn.confirmTransaction(sig, "confirmed");
  return sig;
};

console.log("buyer", owner);
let s = await state();
console.log("start   seatsLeft", s.seatsLeft, "usdc", s.usdc, "seats", s.seats);
console.log("faucet ", await post("faucet"));
s = await state();
console.log("        usdc", s.usdc);
console.log("buy    ", await post("buy"));
s = await state();
console.log("        seatsLeft", s.seatsLeft, "usdc", s.usdc, "seats", s.seats);
console.log("refund ", await post("refund"));
s = await state();
console.log("end     seatsLeft", s.seatsLeft, "usdc", s.usdc, "seats", s.seats);
