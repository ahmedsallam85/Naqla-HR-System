"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FieldType = "text" | "email" | "date" | "number" | "select";

type FieldConfig = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: { value: string; label: string }[];
};

type ManagerOption = { id: string; fullName: string; employeeCode: string };

const IDENTITY_FIELDS: FieldConfig[] = [
  { name: "firstName", label: "First name", type: "text", required: true },
  { name: "lastName", label: "Last name", type: "text", required: true },
  { name: "businessEmail", label: "Business email", type: "email", required: true },
  { name: "personalEmail", label: "Personal email", type: "email" },
  { name: "photoUrl", label: "Photo URL", type: "text" },
];

const ORG_FIELDS: FieldConfig[] = [
  { name: "workLocation", label: "Work location", type: "text" },
  { name: "businessUnit", label: "Business unit", type: "text" },
  { name: "designation", label: "Designation", type: "text" },
  { name: "division", label: "Division", type: "text" },
  { name: "function", label: "Function", type: "text" },
  { name: "functionType", label: "Function type", type: "text" },
  { name: "vertical", label: "Vertical", type: "text" },
  { name: "jobLocation", label: "Job location", type: "text" },
  { name: "department", label: "Department", type: "text" },
  { name: "systemAuthority", label: "System authority", type: "text" },
];

const EMPLOYMENT_FIELDS: FieldConfig[] = [
  {
    name: "contractType",
    label: "Contract type",
    type: "select",
    options: [
      { value: "PERMANENT", label: "Permanent" },
      { value: "FIXED_TERM", label: "Fixed term" },
      { value: "PROBATION", label: "Probation" },
      { value: "CONTRACTOR", label: "Contractor" },
    ],
  },
  { name: "contractRenewalDate", label: "Contract renewal date", type: "date" },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "ACTIVE", label: "Active" },
      { value: "RESIGNED", label: "Resigned" },
    ],
  },
  { name: "sourceOfHiring", label: "Source of hiring", type: "text" },
  { name: "dateOfJoining", label: "Date of joining", type: "date" },
  { name: "dateOfExit", label: "Date of exit", type: "date" },
];

const PERSONAL_FIELDS: FieldConfig[] = [
  { name: "dateOfBirth", label: "Date of birth", type: "date" },
  {
    name: "gender",
    label: "Gender",
    type: "select",
    options: [
      { value: "MALE", label: "Male" },
      { value: "FEMALE", label: "Female" },
    ],
  },
  {
    name: "maritalStatus",
    label: "Marital status",
    type: "select",
    options: [
      { value: "SINGLE", label: "Single" },
      { value: "MARRIED", label: "Married" },
      { value: "DIVORCED", label: "Divorced" },
      { value: "WIDOWED", label: "Widowed" },
    ],
  },
  { name: "workPhone", label: "Work phone", type: "text" },
  { name: "personalPhone", label: "Personal phone", type: "text" },
  { name: "alternativePhone", label: "Alternative phone", type: "text" },
  { name: "presentAddress", label: "Present address", type: "text" },
  { name: "idAddress", label: "ID address", type: "text" },
  { name: "socialInsuranceNumber", label: "Social insurance number", type: "text" },
  { name: "socialInsuranceStatus", label: "Social insurance status", type: "text" },
  { name: "medicalInsurancePlan", label: "Medical insurance plan", type: "text" },
  {
    name: "medicalInsuranceExpiryDate",
    label: "Medical insurance expiry date",
    type: "date",
  },
  { name: "bankAccountName", label: "Bank account name", type: "text" },
  { name: "bankAccountNumber", label: "Bank account number", type: "text" },
  { name: "idNumber", label: "ID number", type: "text" },
  { name: "idExpiryDate", label: "ID expiry date", type: "date" },
];

const CAREER_FIELDS: FieldConfig[] = [
  { name: "jobLevel", label: "Job level", type: "text" },
  { name: "personalLevel", label: "Personal level", type: "text" },
  { name: "lastPromotionDate", label: "Last promotion date", type: "date" },
  { name: "previousTitleAtPromotion", label: "Previous title (promotion)", type: "text" },
  { name: "lastTransferDate", label: "Last transfer date", type: "date" },
  { name: "previousTitleAtTransfer", label: "Previous title (transfer)", type: "text" },
  { name: "probationScore", label: "Probation score", type: "number" },
  {
    name: "talentStatus",
    label: "Talent status",
    type: "select",
    options: [
      { value: "NOT_ASSESSED", label: "Not assessed" },
      { value: "CORE", label: "Core" },
      { value: "HIGH_POTENTIAL", label: "High potential" },
      { value: "TOP_TALENT", label: "Top talent" },
      { value: "AT_RISK", label: "At risk" },
    ],
  },
  { name: "lastTalentEvaluationDate", label: "Last talent evaluation date", type: "date" },
];

function toDateInputValue(value: unknown) {
  if (!value) return "";
  const d = new Date(value as string);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function buildInitialState(employee?: Record<string, unknown>) {
  const state: Record<string, string> = {};
  const allFields = [
    ...IDENTITY_FIELDS,
    ...ORG_FIELDS,
    ...EMPLOYMENT_FIELDS,
    ...PERSONAL_FIELDS,
    ...CAREER_FIELDS,
  ];
  for (const field of allFields) {
    const raw = employee?.[field.name];
    if (field.type === "date") {
      state[field.name] = toDateInputValue(raw);
    } else {
      state[field.name] = raw == null ? "" : String(raw);
    }
  }
  state.reportingManagerId = (employee?.reportingManagerId as string) || "";
  return state;
}

function FieldGroup({
  title,
  fields,
  values,
  onChange,
}: {
  title: string;
  fields: FieldConfig[];
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-primary"> *</span>}
            </Label>
            {field.type === "select" ? (
              <Select
                value={values[field.name] || undefined}
                onValueChange={(v) => onChange(field.name, v ?? "")}
              >
                <SelectTrigger id={field.name} className="w-full">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id={field.name}
                type={field.type}
                value={values[field.name] || ""}
                required={field.required}
                onChange={(e) => onChange(field.name, e.target.value)}
              />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function EmployeeForm({
  mode,
  employee,
  managers,
}: {
  mode: "create" | "edit";
  employee?: Record<string, unknown>;
  managers: ManagerOption[];
}) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(() =>
    buildInitialState(employee)
  );
  const [submitting, setSubmitting] = useState(false);

  function onChange(name: string, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const url =
      mode === "create" ? "/api/employees" : `/api/employees/${employee?.id}`;
    const method = mode === "create" ? "POST" : "PATCH";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error(body?.error?.toString?.() || "Failed to save employee");
      return;
    }

    const saved = await res.json();
    toast.success(mode === "create" ? "Employee created" : "Employee updated");
    router.push(`/personnel/${saved.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FieldGroup
        title="Identity"
        fields={IDENTITY_FIELDS}
        values={values}
        onChange={onChange}
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Org placement</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {ORG_FIELDS.map((field) => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name}>{field.label}</Label>
              <Input
                id={field.name}
                value={values[field.name] || ""}
                onChange={(e) => onChange(field.name, e.target.value)}
              />
            </div>
          ))}
          <div className="space-y-2">
            <Label htmlFor="reportingManagerId">Reporting manager</Label>
            <Select
              value={values.reportingManagerId || undefined}
              onValueChange={(v) => onChange("reportingManagerId", v ?? "")}
            >
              <SelectTrigger id="reportingManagerId" className="w-full">
                <SelectValue placeholder="Select manager..." />
              </SelectTrigger>
              <SelectContent>
                {managers.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.fullName} ({m.employeeCode})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      <FieldGroup
        title="Employment"
        fields={EMPLOYMENT_FIELDS}
        values={values}
        onChange={onChange}
      />
      <FieldGroup
        title="Personal"
        fields={PERSONAL_FIELDS}
        values={values}
        onChange={onChange}
      />
      <FieldGroup
        title="Career"
        fields={CAREER_FIELDS}
        values={values}
        onChange={onChange}
      />
      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : mode === "create" ? "Create employee" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
