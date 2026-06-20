import { prisma } from "@/lib/prisma";
import { LOOKUP_CATEGORY_KEYS, type LookupCategoryKey } from "@/lib/lookup-categories";

export async function getActiveLookups() {
  const rows = await prisma.lookupValue.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { value: "asc" }],
    select: { id: true, category: true, value: true },
  });

  const grouped: Partial<Record<LookupCategoryKey, { id: string; value: string }[]>> = {};
  for (const key of LOOKUP_CATEGORY_KEYS) {
    grouped[key] = rows.filter((r) => r.category === key);
  }
  return grouped;
}
