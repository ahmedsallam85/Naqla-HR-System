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

function fmtBool(v: boolean | null | undefined) {
  if (v === true) return "Yes";
  if (v === false) return "No";
  return null;
}

function SectionCard({
  title,
  sectionNumber,
  cols = 3,
  children,
}: {
  title: string;
  sectionNumber: number;
  cols?: 2 | 3 | 4;
  children: React.ReactNode;
}) {
  const gridClass =
    cols === 4
      ? "grid-cols-2 lg:grid-cols-4"
      : cols === 3
        ? "grid-cols-2 lg:grid-cols-3"
        : "grid-cols-2";

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-muted/40 px-6 py-3">
        <CardTitle className="flex items-center gap-2.5 text-sm font-semibold">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
            {sectionNumber}
          </span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className={`grid ${gridClass} gap-x-6 gap-y-5 p-6`}>
        {children}
      </CardContent>
    </Card>
  );
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
    <div className="space-y-4">
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

      {/* 1. Personal Information */}
      <SectionCard title="Personal Information" sectionNumber={1}>
        <DetailRow label="Employee ID" value={employee.employeeCode} />
        <DetailRow label="Full Name" value={employee.fullName} />
        <DetailRow label="National ID" value={employee.idNumber} />
        <DetailRow label="National ID Expiry" value={fmtDate(employee.idExpiryDate)} />
        <DetailRow label="Date of Birth" value={fmtDate(employee.dateOfBirth)} />
        <DetailRow label="Age" value={calculateAge(employee.dateOfBirth)} />
        <DetailRow label="Gender" value={employee.gender} />
        <DetailRow label="Marital Status" value={employee.maritalStatus} />
        <DetailRow label="Nationality" value={employee.nationality} />
        <DetailRow label="Number of Dependents" value={employee.numberOfDependents} />
      </SectionCard>

      {/* 2. Contact Information */}
      <SectionCard title="Contact Information" sectionNumber={2}>
        <DetailRow label="Mobile Number" value={employee.personalPhone} />
        <DetailRow label="Personal Email" value={employee.personalEmail} />
        <DetailRow label="Company Email" value={employee.businessEmail} />
        <DetailRow label="Home Address" value={employee.presentAddress} />
        <DetailRow label="Emergency Contact Name" value={employee.emergencyContactName} />
        <DetailRow label="Emergency Contact Relationship" value={employee.emergencyContactRelationship} />
        <DetailRow label="Emergency Contact Phone" value={employee.emergencyContactPhone} />
      </SectionCard>

      {/* 3. Employment Details */}
      <SectionCard title="Employment Details" sectionNumber={3}>
        <DetailRow label="Hire Date" value={fmtDate(employee.dateOfJoining)} />
        <DetailRow label="Employment Status" value={employee.status} />
        <DetailRow label="Contract Type" value={employee.contractType} />
        <DetailRow label="Job Title" value={employee.designation} />
        <DetailRow label="Division" value={employee.division} />
        <DetailRow label="Department" value={employee.department} />
        <DetailRow label="Vertical" value={employee.vertical} />
        <DetailRow label="Direct Manager" value={employee.reportingManager?.fullName} />
        <DetailRow label="Function Type" value={employee.functionType} />
        <DetailRow label="Work Location / Site" value={employee.workLocation} />
        <DetailRow label="Probation End Date" value={fmtDate(employee.probationEndDate)} />
        <DetailRow label="Contract End Date" value={fmtDate(employee.contractRenewalDate)} />
        <DetailRow label="Hiring Source" value={employee.sourceOfHiring} />
      </SectionCard>

      {/* 4. Organizational Data */}
      <SectionCard title="Organizational Data" sectionNumber={4}>
        <DetailRow label="Legal Entity" value={employee.legalEntity} />
        <DetailRow label="Grade / Job Level" value={employee.jobLevel} />
        <DetailRow label="Personal Level" value={employee.personalLevel} />
        <DetailRow label="System Authority" value={employee.systemAuthority} />
        <DetailRow label="Cost Center" value={employee.costCenter} />
        <DetailRow label="Last Promotion / Transfer Date" value={fmtDate(employee.lastPromotionTransferDate)} />
        <DetailRow label="Previous Designation" value={employee.previousDesignation} />
      </SectionCard>

      {/* 5. Compensation & Benefits */}
      <SectionCard title="Compensation & Benefits" sectionNumber={5}>
        <DetailRow label="Social Insurance No." value={employee.socialInsuranceNumber} />
        <DetailRow label="Social Insurance Status" value={employee.socialInsuranceStatus} />
        <DetailRow label="Social Insurance Salary" value={employee.socialInsuranceSalary?.toLocaleString()} />
        <DetailRow label="Bank Account No." value={employee.bankAccountNumber} />
        <DetailRow label="Medical Insurance Plan" value={employee.medicalInsurancePlan} />
        <DetailRow label="Medical Insurance Expiry" value={fmtDate(employee.medicalInsuranceExpiryDate)} />
      </SectionCard>

      {/* 6. Attendance & Leave */}
      <SectionCard title="Attendance & Leave" sectionNumber={6} cols={3}>
        <DetailRow label="Annual Leave Balance" value={employee.annualLeaveBalance} />
        <DetailRow label="Sick Leave Taken" value={employee.sickLeaveTaken} />
        <DetailRow label="Hajj Leave Used" value={employee.hajjLeaveUsed} />
      </SectionCard>

      {/* 7. Legal & Compliance */}
      <SectionCard title="Legal & Compliance" sectionNumber={7} cols={3}>
        <DetailRow label="Work Permit Status" value={employee.workPermitStatus} />
        <DetailRow label="Contract Signed" value={fmtBool(employee.contractSigned)} />
        <DetailRow label="Labor Law Category" value={employee.laborLawCategory} />
      </SectionCard>

      {/* 8. Exit Data */}
      <SectionCard title="Exit Data" sectionNumber={8}>
        <DetailRow label="Resignation / Termination Date" value={fmtDate(employee.dateOfExit)} />
        <DetailRow label="Reason for Leaving" value={employee.reasonForLeaving} />
        <DetailRow label="End-of-Service Settlement" value={employee.endOfServiceSettlement?.toLocaleString()} />
        <DetailRow label="Rehire Eligible" value={fmtBool(employee.rehireEligible)} />
      </SectionCard>
    </div>
  );
}
