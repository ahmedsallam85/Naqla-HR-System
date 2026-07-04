"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { LookupCategoryKey } from "@/lib/lookup-categories";
import {
  type FieldConfig,
  PERSONAL_INFO_FIELDS,
  CONTACT_FIELDS,
  EMPLOYMENT_FIELDS,
  ORG_DATA_FIELDS,
  COMP_BENEFITS_FIELDS,
  ATTENDANCE_FIELDS,
  LEGAL_FIELDS,
  EXIT_FIELDS,
} from "@/lib/employee-fields";

type ManagerOption = { id: string; fullName: string; employeeCode: string };
type LookupOption = { id: string; value: string };
type Lookups = Partial<Record<LookupCategoryKey, LookupOption[]>>;

function toDateInputValue(value: unknown) {
  if (!value) return "";
  const d = new Date(value as string);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function buildInitialState(employee?: Record<string, unknown>) {
  const state: Record<string, string> = {};
  const allFields = [
    ...PERSONAL_INFO_FIELDS,
    ...CONTACT_FIELDS,
    ...EMPLOYMENT_FIELDS,
    ...ORG_DATA_FIELDS,
    ...COMP_BENEFITS_FIELDS,
    ...ATTENDANCE_FIELDS,
    ...LEGAL_FIELDS,
    ...EXIT_FIELDS,
  ];
  for (const field of allFields) {
    if (field.name === "employeeCode") {
      state.employeeCode = (employee?.employeeCode as string) || "";
      continue;
    }
    const raw = employee?.[field.name];
    if (field.type === "date") {
      state[field.name] = toDateInputValue(raw);
    } else if (typeof raw === "boolean") {
      state[field.name] = String(raw);
    } else {
      state[field.name] = raw == null ? "" : String(raw);
    }
  }
  if (!state.fullName && employee?.fullName) {
    state.fullName = employee.fullName as string;
  }
  state.reportingManagerId = (employee?.reportingManagerId as string) || "";
  return state;
}

function resolveOptions(
  field: FieldConfig,
  lookups: Lookups,
  currentValue: string
): { value: string; label: string }[] {
  if (!field.lookupCategory) return field.options ?? [];
  const fromLookup = (lookups[field.lookupCategory] ?? []).map((l) => ({
    value: l.value,
    label: l.value,
  }));
  if (currentValue && !fromLookup.some((o) => o.value === currentValue)) {
    return [{ value: currentValue, label: currentValue }, ...fromLookup];
  }
  return fromLookup;
}

function FieldItem({
  field,
  value,
  onChange,
  lookups,
}: {
  field: FieldConfig;
  value: string;
  onChange: (name: string, value: string) => void;
  lookups: Lookups;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={field.name} className="text-sm font-medium">
        {field.label}
        {field.required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {field.disabled ? (
        <Input
          id={field.name}
          value={value}
          disabled
          placeholder={!value ? "Auto-generated on save" : undefined}
          className="h-10 bg-muted text-muted-foreground"
        />
      ) : field.type === "select" ? (
        <Select
          value={value || undefined}
          onValueChange={(v) => onChange(field.name, v ?? "")}
        >
          <SelectTrigger id={field.name} className="h-10 w-full">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            {resolveOptions(field, lookups, value).map((opt) => (
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
          value={value}
          required={field.required}
          className="h-10"
          onChange={(e) => onChange(field.name, e.target.value)}
        />
      )}
    </div>
  );
}

function Section({
  title,
  sectionNumber,
  fields,
  values,
  onChange,
  lookups,
  cols = 2,
  children,
}: {
  title: string;
  sectionNumber: number;
  fields: FieldConfig[];
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
  lookups: Lookups;
  cols?: 2 | 3;
  children?: React.ReactNode;
}) {
  const gridClass =
    cols === 3
      ? "grid-cols-1 sm:grid-cols-3"
      : "grid-cols-1 sm:grid-cols-2";

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
        {fields.map((field) => (
          <FieldItem
            key={field.name}
            field={field}
            value={values[field.name] ?? ""}
            onChange={onChange}
            lookups={lookups}
          />
        ))}
        {children}
      </CardContent>
    </Card>
  );
}

export function EmployeeForm({
  mode,
  employee,
  managers,
  lookups,
}: {
  mode: "create" | "edit";
  employee?: Record<string, unknown>;
  managers: ManagerOption[];
  lookups: Lookups;
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <Section
        title="Personal Information"
        sectionNumber={1}
        fields={PERSONAL_INFO_FIELDS}
        values={values}
        onChange={onChange}
        lookups={lookups}
      />

      <Section
        title="Contact Information"
        sectionNumber={2}
        fields={CONTACT_FIELDS}
        values={values}
        onChange={onChange}
        lookups={lookups}
      />

      <Section
        title="Employment Details"
        sectionNumber={3}
        fields={EMPLOYMENT_FIELDS}
        values={values}
        onChange={onChange}
        lookups={lookups}
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="reportingManagerId" className="text-sm font-medium">
            Direct Manager
          </Label>
          <Select
            value={values.reportingManagerId || undefined}
            onValueChange={(v) => onChange("reportingManagerId", v ?? "")}
          >
            <SelectTrigger id="reportingManagerId" className="h-10 w-full">
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
      </Section>

      <Section
        title="Organizational Data"
        sectionNumber={4}
        fields={ORG_DATA_FIELDS}
        values={values}
        onChange={onChange}
        lookups={lookups}
      />

      <Section
        title="Compensation & Benefits"
        sectionNumber={5}
        fields={COMP_BENEFITS_FIELDS}
        values={values}
        onChange={onChange}
        lookups={lookups}
      />

      <Section
        title="Attendance & Leave"
        sectionNumber={6}
        fields={ATTENDANCE_FIELDS}
        cols={3}
        values={values}
        onChange={onChange}
        lookups={lookups}
      />

      <Section
        title="Legal & Compliance"
        sectionNumber={7}
        fields={LEGAL_FIELDS}
        cols={3}
        values={values}
        onChange={onChange}
        lookups={lookups}
      />

      <Section
        title="Exit Data"
        sectionNumber={8}
        fields={EXIT_FIELDS}
        values={values}
        onChange={onChange}
        lookups={lookups}
      />

      <div className="flex justify-end gap-3 pt-2">
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
