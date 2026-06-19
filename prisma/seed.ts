import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function upsertUser(email: string, password: string, role: "HR_ADMIN" | "HIRING_MANAGER" | "LINE_MANAGER" | "EMPLOYEE") {
  const passwordHash = await bcrypt.hash(password, 10);
  return prisma.user.upsert({
    where: { email },
    update: { passwordHash, role },
    create: { email, passwordHash, role },
  });
}

async function main() {
  await upsertUser("admin@naqla.com", "ChangeMe123!", "HR_ADMIN");
  await upsertUser("manager@naqla.com", "ChangeMe123!", "LINE_MANAGER");
  await upsertUser("employee@naqla.com", "ChangeMe123!", "EMPLOYEE");

  const existing = await prisma.employee.count();
  if (existing > 0) {
    console.log(`Employees already seeded (${existing}), skipping sample employees.`);
    return;
  }

  const ceo = await prisma.employee.create({
    data: {
      employeeCode: "NQ-00001",
      firstName: "Yasmine",
      lastName: "Hassan",
      fullName: "Yasmine Hassan",
      businessEmail: "yasmine.hassan@naqla.com",
      designation: "Chief Executive Officer",
      department: "Executive",
      businessUnit: "Corporate",
      status: "ACTIVE",
      contractType: "PERMANENT",
      dateOfJoining: new Date("2019-03-01"),
      jobLevel: "L1",
      talentStatus: "TOP_TALENT",
      gender: "FEMALE",
    },
  });

  const hrDirector = await prisma.employee.create({
    data: {
      employeeCode: "NQ-00002",
      firstName: "Omar",
      lastName: "Khalil",
      fullName: "Omar Khalil",
      businessEmail: "omar.khalil@naqla.com",
      designation: "HR Director",
      department: "People & Culture",
      businessUnit: "Corporate",
      status: "ACTIVE",
      contractType: "PERMANENT",
      dateOfJoining: new Date("2020-06-15"),
      jobLevel: "L2",
      reportingManagerId: ceo.id,
      talentStatus: "HIGH_POTENTIAL",
      gender: "MALE",
      contractRenewalDate: new Date(
        new Date().setMonth(new Date().getMonth() + 2)
      ),
    },
  });

  await prisma.employee.create({
    data: {
      employeeCode: "NQ-00003",
      firstName: "Mariam",
      lastName: "Adel",
      fullName: "Mariam Adel",
      businessEmail: "mariam.adel@naqla.com",
      designation: "Recruitment Specialist",
      department: "People & Culture",
      businessUnit: "Corporate",
      status: "ACTIVE",
      contractType: "FIXED_TERM",
      dateOfJoining: new Date("2023-01-10"),
      jobLevel: "L4",
      reportingManagerId: hrDirector.id,
      talentStatus: "CORE",
      gender: "FEMALE",
    },
  });

  await prisma.employee.create({
    data: {
      employeeCode: "NQ-00004",
      firstName: "Karim",
      lastName: "Fathy",
      fullName: "Karim Fathy",
      businessEmail: "karim.fathy@naqla.com",
      designation: "Fleet Operations Manager",
      department: "Operations",
      businessUnit: "Transport",
      status: "ACTIVE",
      contractType: "PROBATION",
      dateOfJoining: new Date(new Date().setDate(new Date().getDate() - 70)),
      jobLevel: "L3",
      reportingManagerId: ceo.id,
      talentStatus: "NOT_ASSESSED",
      gender: "MALE",
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
