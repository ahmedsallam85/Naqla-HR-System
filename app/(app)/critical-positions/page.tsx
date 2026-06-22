import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImportDesignationsDialog } from "@/components/import-designations-dialog";
import { PRIORITY_INFO } from "@/lib/critical-assessment";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function CriticalPositionsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const session = await auth();
  const isAdmin = session?.user?.role === "HR_ADMIN";

  const designations = await prisma.designation.findMany({
    where: q
      ? {
          OR: [
            { title: { contains: q } },
            { grade: { contains: q } },
            { holderName: { contains: q } },
          ],
        }
      : undefined,
    include: {
      holder: { select: { fullName: true } },
      assessments: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Critical Positions</h1>
          <p className="text-muted-foreground">
            {designations.length} position{designations.length === 1 ? "" : "s"} —
            succession planning assessment
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            nativeButton={false}
            // eslint-disable-next-line @next/next/no-html-link-for-pages -- file download, not a page route
            render={<a href="/api/designations/export">Export to Excel</a>}
          />
          {isAdmin && <ImportDesignationsDialog />}
          {isAdmin && (
            <Button
              nativeButton={false}
              render={<Link href="/critical-positions/new">Add position</Link>}
            />
          )}
        </div>
      </div>

      <form className="flex gap-2" method="GET">
        <input
          name="q"
          defaultValue={q || ""}
          placeholder="Search by title, grade, holder..."
          className="flex h-9 w-full max-w-md rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Holder</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Priority</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {designations.map((d) => {
              const latest = d.assessments[0];
              return (
                <TableRow key={d.id}>
                  <TableCell>
                    <Link
                      href={`/critical-positions/${d.id}`}
                      className="font-medium hover:text-primary"
                    >
                      {d.title}
                    </Link>
                  </TableCell>
                  <TableCell>{d.grade || "—"}</TableCell>
                  <TableCell>{d.holder?.fullName || d.holderName || "—"}</TableCell>
                  <TableCell>{latest?.total ?? "—"}</TableCell>
                  <TableCell>
                    {latest ? (
                      <Badge
                        variant={
                          latest.priority === "IMPERATIVE"
                            ? "destructive"
                            : latest.priority === "IMPORTANT"
                              ? "default"
                              : "secondary"
                        }
                      >
                        {PRIORITY_INFO[latest.priority as keyof typeof PRIORITY_INFO].label}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">Not assessed</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {designations.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No positions yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
