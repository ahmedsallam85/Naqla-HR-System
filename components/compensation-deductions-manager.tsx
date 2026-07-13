"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FREQUENCY_OPTIONS,
  frequencyLabel,
  frequencyBadgeVariant,
  type ExtraFrequency,
} from "@/components/compensation-extras-manager";

type LookupValue = { id: string; value: string };

type Deduction = {
  id: string;
  type: string;
  totalAmount: number | null;
  numInstallments: number | null;
  monthlyAmount: number;
  frequency: string;
  startDate: string;
  endDate: string | null;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";
  notes: string | null;
};

export function CompensationDeductionsManager({ employeeId }: { employeeId: string }) {
  const [deductions, setDeductions] = useState<Deduction[]>([]);
  const [types, setTypes] = useState<LookupValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [type, setType] = useState<string>("");
  const [monthlyAmount, setMonthlyAmount] = useState("");
  const [frequency, setFrequency] = useState<ExtraFrequency>("MONTHLY");
  const [totalAmount, setTotalAmount] = useState("");
  const [numInstallments, setNumInstallments] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");

  async function load() {
    setLoading(true);
    const [deductionsRes, typesRes] = await Promise.all([
      fetch(`/api/compensation/${employeeId}/deductions`),
      fetch(`/api/admin/lookups?category=COMPENSATION_DEDUCTION_TYPE`),
    ]);
    if (deductionsRes.ok) setDeductions(await deductionsRes.json());
    if (typesRes.ok) setTypes(await typesRes.json());
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load on mount
    void load();
  }, [employeeId]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!monthlyAmount || !startDate) return;
    setSubmitting(true);

    const res = await fetch(`/api/compensation/${employeeId}/deductions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        monthlyAmount: Number(monthlyAmount),
        frequency,
        totalAmount: totalAmount ? Number(totalAmount) : undefined,
        numInstallments: numInstallments ? Number(numInstallments) : undefined,
        startDate,
        endDate: frequency !== "ONE_TIME" && endDate ? endDate : undefined,
        notes: notes || undefined,
      }),
    });

    setSubmitting(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error(body?.error?.toString?.() || "Failed to add deduction");
      return;
    }

    setMonthlyAmount("");
    setFrequency("MONTHLY");
    setTotalAmount("");
    setNumInstallments("");
    setStartDate("");
    setEndDate("");
    setNotes("");
    toast.success("Deduction added");
    load();
  }

  async function setStatus(id: string, status: string) {
    const res = await fetch(`/api/compensation/deductions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      toast.error("Failed to update deduction");
      return;
    }
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this deduction? This cannot be undone.")) return;
    const res = await fetch(`/api/compensation/deductions/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to delete deduction");
      return;
    }
    toast.success("Deduction deleted");
    load();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Deductions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleAdd} className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <div className="space-y-1">
            <Label htmlFor="deductionType">Type</Label>
            <Select value={type} onValueChange={(v) => setType(v ?? "")}>
              <SelectTrigger id="deductionType" className="w-full">
                <SelectValue placeholder={types.length === 0 ? "Add types in admin" : "Select type"} />
              </SelectTrigger>
              <SelectContent>
                {types.map((t) => (
                  <SelectItem key={t.id} value={t.value}>
                    {t.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="deductionAmount">Amount per period</Label>
            <Input
              id="deductionAmount"
              type="number"
              min="0"
              value={monthlyAmount}
              onChange={(e) => setMonthlyAmount(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="deductionFrequency">Frequency</Label>
            <Select
              value={frequency}
              onValueChange={(v) => setFrequency((v ?? "MONTHLY") as ExtraFrequency)}
            >
              <SelectTrigger id="deductionFrequency" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FREQUENCY_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="deductionTotalAmount">Total amount</Label>
            <Input
              id="deductionTotalAmount"
              type="number"
              min="0"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder="optional"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="deductionNumInstallments"># installments</Label>
            <Input
              id="deductionNumInstallments"
              type="number"
              min="1"
              value={numInstallments}
              onChange={(e) => setNumInstallments(e.target.value)}
              placeholder="optional"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="deductionStartDate">Start date</Label>
            <Input
              id="deductionStartDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          {frequency !== "ONE_TIME" && (
            <div className="space-y-1">
              <Label htmlFor="deductionEndDate">End date</Label>
              <Input
                id="deductionEndDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          )}
          <div className="col-span-full space-y-1">
            <Label htmlFor="deductionNotes">Notes</Label>
            <Input
              id="deductionNotes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="optional"
            />
          </div>
          <div className="col-span-full flex justify-end">
            <Button type="submit" disabled={submitting || !type}>
              Add deduction
            </Button>
          </div>
        </form>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>End</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deductions.map((d) => (
              <TableRow key={d.id}>
                <TableCell>{d.type}</TableCell>
                <TableCell>{d.monthlyAmount.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant={frequencyBadgeVariant(d.frequency ?? "MONTHLY")}>
                    {frequencyLabel(d.frequency ?? "MONTHLY")}
                  </Badge>
                </TableCell>
                <TableCell>{d.totalAmount?.toLocaleString() ?? "—"}</TableCell>
                <TableCell>{new Date(d.startDate).toLocaleDateString()}</TableCell>
                <TableCell className="text-muted-foreground">
                  {d.endDate ? new Date(d.endDate).toLocaleDateString() : "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={d.status === "ACTIVE" ? "default" : "secondary"}>
                    {d.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  {d.status === "ACTIVE" && (
                    <Button size="sm" variant="ghost" onClick={() => setStatus(d.id, "CANCELLED")}>
                      Cancel
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(d.id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!loading && deductions.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  No deductions yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
