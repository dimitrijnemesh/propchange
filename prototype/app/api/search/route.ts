import { searchIndex } from "@/lib/search-index";

/** Navbar search index, fetched lazily by the client (kept out of every page payload). */
export const dynamic = "force-static";

export function GET() {
  return Response.json(searchIndex(), {
    headers: { "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
