import { NextResponse } from "next/server";
import { PublicKey, Transaction } from "@solana/web3.js";
import {
  createAssociatedTokenAccountIdempotentInstruction,
  createMintToCheckedInstruction,
  createTransferCheckedInstruction,
  getAccount,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { USDC_DECIMALS, connection, devnetConfig, escrowKeypair, parseOwner } from "@/lib/devnet-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FAUCET_USDC = 100;
const units = (usdc: number) => BigInt(Math.round(usdc * 10 ** USDC_DECIMALS));

async function balance(conn: ReturnType<typeof connection>, ata: PublicKey, program: PublicKey) {
  try {
    return (await getAccount(conn, ata, "confirmed", program)).amount;
  } catch {
    return BigInt(0);
  }
}

/** GET /api/devnet?owner=… — public config + the owner's dUSDC / Seat balances and Seats left in escrow. */
export async function GET(req: Request) {
  const cfg = devnetConfig();
  if (!cfg) return NextResponse.json({ enabled: false });
  const owner = parseOwner(new URL(req.url).searchParams.get("owner"));
  const conn = connection();
  const program = new PublicKey(cfg.tokenProgram);
  const seatMint = new PublicKey(cfg.seat.mint);
  const usdcMint = new PublicKey(cfg.usdcMint);
  const escrow = new PublicKey(cfg.escrow);
  const seatsLeft = await balance(conn, getAssociatedTokenAddressSync(seatMint, escrow, false, program), program);
  const body: Record<string, unknown> = { enabled: true, config: cfg, seatsLeft: Number(seatsLeft) };
  if (owner) {
    body.usdc = Number(await balance(conn, getAssociatedTokenAddressSync(usdcMint, owner, false, program), program)) / 10 ** USDC_DECIMALS;
    body.seats = Number(await balance(conn, getAssociatedTokenAddressSync(seatMint, owner, false, program), program));
  }
  return NextResponse.json(body);
}

/**
 * POST /api/devnet { action, owner }
 *  • faucet — escrow mints 100 test USDC to the owner (sent and confirmed here; escrow pays the fee)
 *  • buy    — returns a transaction for the owner to sign: owner pays the Seat price in dUSDC into escrow and
 *             receives 1 Seat token from escrow, atomically; escrow pays the network fee and co-signs
 *  • refund — returns a transaction for the owner to sign on a breach: the owner hands the Seat back and the
 *             escrow returns the Seat price in dUSDC, atomically
 */
export async function POST(req: Request) {
  const cfg = devnetConfig();
  const escrow = escrowKeypair();
  if (!cfg || !escrow) return NextResponse.json({ error: "Devnet demo is not configured" }, { status: 503 });
  const { action, owner: rawOwner } = (await req.json().catch(() => ({}))) as { action?: string; owner?: string };
  const owner = parseOwner(rawOwner);
  if (!owner) return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 });

  const conn = connection();
  const program = new PublicKey(cfg.tokenProgram);
  const usdcMint = new PublicKey(cfg.usdcMint);
  const seatMint = new PublicKey(cfg.seat.mint);
  const ownerUsdc = getAssociatedTokenAddressSync(usdcMint, owner, false, program);
  const ownerSeat = getAssociatedTokenAddressSync(seatMint, owner, false, program);
  const escrowUsdc = new PublicKey(cfg.escrowUsdcAccount);
  const escrowSeat = getAssociatedTokenAddressSync(seatMint, escrow.publicKey, false, program);
  const price = units(cfg.seat.priceUsdc);
  const { blockhash, lastValidBlockHeight } = await conn.getLatestBlockhash("confirmed");
  const tx = new Transaction({ feePayer: escrow.publicKey, blockhash, lastValidBlockHeight });

  if (action === "faucet") {
    const have = await balance(conn, ownerUsdc, program);
    if (have >= units(FAUCET_USDC * 3)) return NextResponse.json({ error: "You already have plenty of test USDC" }, { status: 429 });
    tx.add(
      createAssociatedTokenAccountIdempotentInstruction(escrow.publicKey, ownerUsdc, owner, usdcMint, program),
      createMintToCheckedInstruction(usdcMint, ownerUsdc, escrow.publicKey, units(FAUCET_USDC), USDC_DECIMALS, [], program),
    );
    tx.sign(escrow);
    const signature = await conn.sendRawTransaction(tx.serialize());
    await conn.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, "confirmed");
    return NextResponse.json({ signature });
  }

  if (action === "buy") {
    if ((await balance(conn, escrowSeat, program)) < BigInt(1)) return NextResponse.json({ error: "Sold out — join the waitlist" }, { status: 409 });
    if ((await balance(conn, ownerUsdc, program)) < price) return NextResponse.json({ error: "Not enough test USDC — tap “Get test USDC” first" }, { status: 402 });
    tx.add(
      createAssociatedTokenAccountIdempotentInstruction(escrow.publicKey, ownerSeat, owner, seatMint, program),
      createTransferCheckedInstruction(ownerUsdc, usdcMint, escrowUsdc, owner, price, USDC_DECIMALS, [], program),
      createTransferCheckedInstruction(escrowSeat, seatMint, ownerSeat, escrow.publicKey, BigInt(1), 0, [], program),
    );
  } else if (action === "refund") {
    if ((await balance(conn, ownerSeat, program)) < BigInt(1)) return NextResponse.json({ error: "You don't hold a Seat to refund" }, { status: 409 });
    tx.add(
      createTransferCheckedInstruction(ownerSeat, seatMint, escrowSeat, owner, BigInt(1), 0, [], program),
      createTransferCheckedInstruction(escrowUsdc, usdcMint, ownerUsdc, escrow.publicKey, price, USDC_DECIMALS, [], program),
    );
  } else {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  tx.partialSign(escrow);
  return NextResponse.json({ transaction: tx.serialize({ requireAllSignatures: false }).toString("base64") });
}
