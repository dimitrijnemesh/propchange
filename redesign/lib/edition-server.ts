import { cookies } from "next/headers";
import { DEFAULT_EDITION, EDITION_COOKIE, type Edition, isEdition } from "./edition";

export async function getEdition(): Promise<Edition> {
  const v = (await cookies()).get(EDITION_COOKIE)?.value;
  return isEdition(v) ? v : DEFAULT_EDITION;
}
