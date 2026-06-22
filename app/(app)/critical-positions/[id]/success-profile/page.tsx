import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SuccessProfileForm } from "@/components/success-profile-form";

export default async function SuccessProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (session?.user?.role !== "HR_ADMIN") {
    redirect(`/critical-positions/${id}`);
  }

  const designation = await prisma.designation.findUnique({
    where: { id },
    include: { successProfiles: { orderBy: { updatedAt: "desc" }, take: 1 } },
  });
  if (!designation) notFound();

  const profile = designation.successProfiles[0] ?? null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Success Profile: {designation.title}</h1>
      <SuccessProfileForm
        designationId={designation.id}
        initial={
          profile
            ? {
                ...profile,
                criteria: profile.criteria as Record<string, string> | null,
                leadership: profile.leadership as Record<string, string> | null,
              }
            : null
        }
      />
    </div>
  );
}
