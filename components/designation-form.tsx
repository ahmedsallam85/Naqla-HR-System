"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type EmployeeOption = { id: string; fullName: string; employeeCode: string };

export function DesignationForm({ employees }: { employees: EmployeeOption[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [grade, setGrade] = useState("");
  const [holderId, setHolderId] = useState("");
  const [holderName, setHolderName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const res = await fetch("/api/designations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, grade, holderId, holderName }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error(body?.error?.toString?.() || "Failed to create position");
      return;
    }

    const created = await res.json();
    toast.success("Position created");
    router.push(`/critical-positions/${created.id}`);
    router.refresh();
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="grade">Grade</Label>
              <Input id="grade" value={grade} onChange={(e) => setGrade(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="holderId">Holder (existing employee)</Label>
              <Select value={holderId} onValueChange={(v) => setHolderId(v ?? "")}>
                <SelectTrigger id="holderId" className="w-full">
                  <SelectValue placeholder="Select employee..." />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.fullName} ({e.employeeCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="holderName">Or holder name (if not yet in Personnel)</Label>
            <Input
              id="holderName"
              value={holderName}
              onChange={(e) => setHolderName(e.target.value)}
              disabled={!!holderId}
              placeholder="Free text name"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title || submitting}>
              {submitting ? "Creating..." : "Create position"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
