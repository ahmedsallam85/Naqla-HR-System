import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function JobRoleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const isAdmin = session?.user?.role === "HR_ADMIN";

  const jobRole = await prisma.jobRole.findUnique({
    where: { id },
    include: {
      evaluations: {
        orderBy: { createdAt: "desc" },
        include: { evaluator: { select: { email: true } } },
      },
    },
  });
  if (!jobRole) notFound();

  const latest = jobRole.evaluations[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{jobRole.title}</h1>
          <p className="text-muted-foreground">
            {jobRole.department || "—"}
            {jobRole.division ? ` · ${jobRole.division}` : ""}
          </p>
        </div>
        {isAdmin && (
          <Button
            nativeButton={false}
            render={<Link href={`/job-grading/${jobRole.id}/evaluate`}>New evaluation</Link>}
          />
        )}
      </div>

      {jobRole.responsibilities && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Job responsibilities</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {jobRole.responsibilities}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current grade</CardTitle>
        </CardHeader>
        <CardContent>
          {latest ? (
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <p className="text-xs text-muted-foreground">Hay level</p>
                <p className="text-2xl font-bold text-primary">{latest.hayLevel}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total points</p>
                <p className="text-2xl font-bold">{latest.totalPoints}</p>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Know-How: {latest.khPoints} ({latest.khNotation})</p>
                <p>Problem Solving: {latest.psPoints}</p>
                <p>Accountability: {latest.accPoints}</p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">
              This role hasn&apos;t been evaluated yet.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Evaluation history</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Evaluator</TableHead>
                <TableHead>KH</TableHead>
                <TableHead>PS</TableHead>
                <TableHead>ACC</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Hay Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobRole.evaluations.map((ev) => (
                <TableRow key={ev.id}>
                  <TableCell>{new Date(ev.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{ev.evaluator?.email ?? "—"}</TableCell>
                  <TableCell>{ev.khPoints}</TableCell>
                  <TableCell>{ev.psPoints}</TableCell>
                  <TableCell>{ev.accPoints}</TableCell>
                  <TableCell className="font-semibold">{ev.totalPoints}</TableCell>
                  <TableCell>
                    <Badge>{ev.hayLevel}</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {jobRole.evaluations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No evaluations yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
