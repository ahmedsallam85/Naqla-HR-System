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
import { PRIORITY_INFO, SECTIONS } from "@/lib/critical-assessment";

export default async function DesignationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const isAdmin = session?.user?.role === "HR_ADMIN";

  const designation = await prisma.designation.findUnique({
    where: { id },
    include: {
      holder: { select: { fullName: true, employeeCode: true } },
      assessments: {
        orderBy: { createdAt: "desc" },
        include: { assessor: { select: { email: true } } },
      },
      successProfiles: { orderBy: { updatedAt: "desc" }, take: 1 },
    },
  });
  if (!designation) notFound();

  const latest = designation.assessments[0];
  const hasProfile = designation.successProfiles.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{designation.title}</h1>
          <p className="text-muted-foreground">
            {designation.grade || "—"} ·{" "}
            {designation.holder?.fullName || designation.holderName || "No holder set"}
          </p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              nativeButton={false}
              render={
                <Link href={`/critical-positions/${designation.id}/success-profile`}>
                  {hasProfile ? "Edit success profile" : "Add success profile"}
                </Link>
              }
            />
            <Button
              nativeButton={false}
              render={<Link href={`/critical-positions/${designation.id}/assess`}>New assessment</Link>}
            />
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current assessment</CardTitle>
        </CardHeader>
        <CardContent>
          {latest ? (
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <p className="text-xs text-muted-foreground">Total score</p>
                <p className="text-2xl font-bold">{latest.total} / 65</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Priority</p>
                <Badge
                  variant={
                    latest.priority === "IMPERATIVE"
                      ? "destructive"
                      : latest.priority === "IMPORTANT"
                        ? "default"
                        : "secondary"
                  }
                  className="text-sm"
                >
                  {PRIORITY_INFO[latest.priority as keyof typeof PRIORITY_INFO].label}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {SECTIONS.map((s, i) => (
                  <span key={s.id} className="mr-3">
                    {s.label.split(" ")[0]}: {latest.sectionScores[i]}/{s.max}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">This position hasn&apos;t been assessed yet.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Assessment history</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Assessor</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Priority</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {designation.assessments.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{new Date(a.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{a.assessor?.email ?? "—"}</TableCell>
                  <TableCell className="font-semibold">{a.total}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        a.priority === "IMPERATIVE"
                          ? "destructive"
                          : a.priority === "IMPORTANT"
                            ? "default"
                            : "secondary"
                      }
                    >
                      {PRIORITY_INFO[a.priority as keyof typeof PRIORITY_INFO].label}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {designation.assessments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No assessments yet.
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
