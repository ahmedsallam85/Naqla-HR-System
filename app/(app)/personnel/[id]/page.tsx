import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { calculateAge, isContractExpiringSoon } from "@/lib/employee";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DetailRow } from "@/components/detail-row";

function fmtDate(d: Date | null | undefined) {
  if (!d) return null;
  return new Date(d).toLocaleDateString();
}

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const isAdmin = session?.user?.role === "HR_ADMIN";

  const employee = await prisma.employee.findUnique({
    where: { id },
    include: { reportingManager: true },
  });
  if (!employee) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{employee.fullName}</h1>
          <p className="text-muted-foreground">
            {employee.employeeCode} · {employee.designation || "—"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={employee.status === "ACTIVE" ? "default" : "secondary"}>
            {employee.status}
          </Badge>
          {isContractExpiringSoon(employee.contractRenewalDate) && (
            <Badge variant="destructive">Contract renewal due</Badge>
          )}
          {isAdmin && (
            <Button
              nativeButton={false}
              render={<Link href={`/personnel/${employee.id}/edit`}>Edit</Link>}
            />
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Identity</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <DetailRow label="Business email" value={employee.businessEmail} />
          <DetailRow label="Personal email" value={employee.personalEmail} />
          <DetailRow label="Date of birth" value={fmtDate(employee.dateOfBirth)} />
          <DetailRow label="Age" value={calculateAge(employee.dateOfBirth)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Org placement</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <DetailRow label="Work location" value={employee.workLocation} />
          <DetailRow label="Business unit" value={employee.businessUnit} />
          <DetailRow label="Division" value={employee.division} />
          <DetailRow label="Function" value={employee.function} />
          <DetailRow label="Function type" value={employee.functionType} />
          <DetailRow label="Vertical" value={employee.vertical} />
          <DetailRow label="Job location" value={employee.jobLocation} />
          <DetailRow label="Department" value={employee.department} />
          <DetailRow label="System authority" value={employee.systemAuthority} />
          <DetailRow
            label="Reporting manager"
            value={employee.reportingManager?.fullName}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Employment</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <DetailRow label="Contract type" value={employee.contractType} />
          <DetailRow
            label="Contract renewal date"
            value={fmtDate(employee.contractRenewalDate)}
          />
          <DetailRow label="Source of hiring" value={employee.sourceOfHiring} />
          <DetailRow label="Date of joining" value={fmtDate(employee.dateOfJoining)} />
          <DetailRow label="Date of exit" value={fmtDate(employee.dateOfExit)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Personal</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <DetailRow label="Gender" value={employee.gender} />
          <DetailRow label="Marital status" value={employee.maritalStatus} />
          <DetailRow label="Work phone" value={employee.workPhone} />
          <DetailRow label="Personal phone" value={employee.personalPhone} />
          <DetailRow label="Alternative phone" value={employee.alternativePhone} />
          <DetailRow label="Present address" value={employee.presentAddress} />
          <DetailRow label="ID address" value={employee.idAddress} />
          <DetailRow
            label="Social insurance number"
            value={employee.socialInsuranceNumber}
          />
          <DetailRow
            label="Social insurance status"
            value={employee.socialInsuranceStatus}
          />
          <DetailRow
            label="Medical insurance plan"
            value={employee.medicalInsurancePlan}
          />
          <DetailRow
            label="Medical insurance expiry"
            value={fmtDate(employee.medicalInsuranceExpiryDate)}
          />
          <DetailRow label="Bank account name" value={employee.bankAccountName} />
          <DetailRow label="Bank account number" value={employee.bankAccountNumber} />
          <DetailRow label="ID number" value={employee.idNumber} />
          <DetailRow label="ID expiry date" value={fmtDate(employee.idExpiryDate)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Career</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <DetailRow label="Job level" value={employee.jobLevel} />
          <DetailRow label="Personal level" value={employee.personalLevel} />
          <DetailRow
            label="Last promotion date"
            value={fmtDate(employee.lastPromotionDate)}
          />
          <DetailRow
            label="Previous title (promotion)"
            value={employee.previousTitleAtPromotion}
          />
          <DetailRow
            label="Last transfer date"
            value={fmtDate(employee.lastTransferDate)}
          />
          <DetailRow
            label="Previous title (transfer)"
            value={employee.previousTitleAtTransfer}
          />
          <DetailRow label="Probation score" value={employee.probationScore} />
          <DetailRow label="Talent status" value={employee.talentStatus} />
          <DetailRow
            label="Last talent evaluation"
            value={fmtDate(employee.lastTalentEvaluationDate)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
