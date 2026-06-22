import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function JobGradingPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "HR_ADMIN";

  const jobRoles = await prisma.jobRole.findMany({
    include: { evaluations: { orderBy: { createdAt: "desc" }, take: 1 } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Job Grading</h1>
          <p className="text-muted-foreground">
            {jobRoles.length} job role{jobRoles.length === 1 ? "" : "s"} — Hay
            methodology evaluation
          </p>
        </div>
        {isAdmin && (
          <Button
            nativeButton={false}
            render={<Link href="/job-grading/new">Add job role</Link>}
          />
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Hay Level</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Last evaluated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobRoles.map((role) => {
              const latest = role.evaluations[0];
              return (
                <TableRow key={role.id}>
                  <TableCell>
                    <Link
                      href={`/job-grading/${role.id}`}
                      className="font-medium hover:text-primary"
                    >
                      {role.title}
                    </Link>
                  </TableCell>
                  <TableCell>{role.department || "—"}</TableCell>
                  <TableCell>
                    {latest ? (
                      <Badge>{latest.hayLevel}</Badge>
                    ) : (
                      <span className="text-muted-foreground">Not evaluated</span>
                    )}
                  </TableCell>
                  <TableCell>{latest?.totalPoints ?? "—"}</TableCell>
                  <TableCell>
                    {latest ? new Date(latest.createdAt).toLocaleDateString() : "—"}
                  </TableCell>
                </TableRow>
              );
            })}
            {jobRoles.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No job roles yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
