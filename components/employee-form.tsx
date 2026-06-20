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
import type { LookupCategoryKey } from "@/lib/lookup-categories";
import {
  type FieldConfig,
  IDENTITY_FIELDS,
  ORG_FIELDS,
  EMPLOYMENT_FIELDS,
  PERSONAL_FIELDS,
  CAREER_FIELDS,
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

function FieldGroup({
  title,
  fields,
  values,
  onChange,
  lookups,
}: {
  title: string;
  fields: FieldConfig[];
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
  lookups: Lookups;
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
                  {resolveOptions(field, lookups, values[field.name]).map((opt) => (
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <FieldGroup
        title="Identity"
        fields={IDENTITY_FIELDS}
        values={values}
        onChange={onChange}
        lookups={lookups}
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Org placement</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {ORG_FIELDS.map((field) => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name}>{field.label}</Label>
              <Select
                value={values[field.name] || undefined}
                onValueChange={(v) => onChange(field.name, v ?? "")}
              >
                <SelectTrigger id={field.name} className="w-full">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {resolveOptions(field, lookups, values[field.name]).map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
        lookups={lookups}
        onChange={onChange}
      />
      <FieldGroup
        title="Personal"
        fields={PERSONAL_FIELDS}
        values={values}
        onChange={onChange}
        lookups={lookups}
      />
      <FieldGroup
        title="Career"
        fields={CAREER_FIELDS}
        values={values}
        onChange={onChange}
        lookups={lookups}
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
