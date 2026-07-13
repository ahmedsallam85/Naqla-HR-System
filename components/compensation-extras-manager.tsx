"use client";

import { useEffect, useState } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export type ExtraFrequency = "MONTHLY" | "QUARTERLY" | "SEMI_ANNUAL" | "ONE_TIME";

export const FREQUENCY_OPTIONS: { value: ExtraFrequency; label: string }[] = [
  { value: "MONTHLY", label: "Recurring (monthly)" },
  { value: "QUARTERLY", label: "Recurring (quarterly)" },
  { value: "SEMI_ANNUAL", label: "Recurring (semi-annually)" },
  { value: "ONE_TIME", label: "One-time" },
];

export function frequencyLabel(f: string) {
  return FREQUENCY_OPTIONS.find((o) => o.value === f)?.label ?? f;
}

/** Monthly equivalent used in tax-pool and total-cost calculations */
export function monthlyEquivalent(amount: number, frequency: string): number {
  switch (frequency) {
    case "MONTHLY": return amount;
    case "QUARTERLY": return amount / 3;
    case "SEMI_ANNUAL": return amount / 6;
    default: return 0; // ONE_TIME — not in recurring total
  }
}

export type Extra = {
  id: string;
  type: string;
  amount: number;
  frequency: string;
  date: string;
  endDate: string | null;
  notes: string | null;
};

type LookupValue = { id: string; value: string };

function money(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function frequencyBadgeVariant(f: string): "default" | "secondary" | "outline" {
  if (f === "ONE_TIME") return "secondary";
  if (f === "MONTHLY") return "default";
  return "outline";
}

export function CompensationExtrasManager({ employeeId }: { employeeId: string }) {
  const [extras, setExtras] = useState<Extra[]>([]);
  const [types, setTypes] = useState<LookupValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [type, setType] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState<ExtraFrequency>("MONTHLY");
  const [date, setDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");

  async function load() {
    setLoading(true);
    const [extrasRes, typesRes] = await Promise.all([
      fetch(`/api/compensation/${employeeId}/extras`),
      fetch(`/api/admin/lookups?category=COMPENSATION_EXTRA_TYPE`),
    ]);
    if (extrasRes.ok) setExtras(await extrasRes.json());
    if (typesRes.ok) setTypes(await typesRes.json());
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load on mount
    void load();
  }, [employeeId]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!type || !amount || !date) return;
    setSubmitting(true);

    const res = await fetch(`/api/compensation/${employeeId}/extras`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        amount: Number(amount),
        frequency,
        date,
        endDate: frequency !== "ONE_TIME" && endDate ? endDate : undefined,
        notes: notes || undefined,
      }),
    });

    setSubmitting(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error(body?.error?.toString?.() || "Failed to add extra");
      return;
    }

    setAmount("");
    setDate("");
    setEndDate("");
    setNotes("");
    toast.success("Extra added");
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this extra? This cannot be undone.")) return;
    const res = await fetch(`/api/compensation/extras/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to delete extra");
      return;
    }
    toast.success("Extra deleted");
    load();
  }

  const monthlyRecurringTotal = extras.reduce(
    (sum, e) => sum + monthlyEquivalent(e.amount, e.frequency),
    0,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Extras</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleAdd} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="space-y-1">
            <Label htmlFor="extraType">Type</Label>
            <Select value={type} onValueChange={(v) => setType(v ?? "")}>
              <SelectTrigger id="extraType" className="w-full">
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
            <Label htmlFor="extraAmount">Amount per period</Label>
            <Input
              id="extraAmount"
              type="number"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="extraFrequency">Frequency</Label>
            <Select
              value={frequency}
              onValueChange={(v) => setFrequency((v ?? "MONTHLY") as ExtraFrequency)}
            >
              <SelectTrigger id="extraFrequency" className="w-full">
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
            <Label htmlFor="extraDate">Effective date</Label>
            <Input
              id="extraDate"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          {frequency !== "ONE_TIME" && (
            <div className="space-y-1">
              <Label htmlFor="extraEndDate">End date</Label>
              <Input
                id="extraEndDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          )}
          <div className="col-span-full space-y-1">
            <Label htmlFor="extraNotes">Notes</Label>
            <Input
              id="extraNotes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="optional"
            />
          </div>
          <div className="col-span-full flex justify-end">
            <Button type="submit" disabled={submitting || !type}>
              Add extra
            </Button>
          </div>
        </form>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Monthly equiv.</TableHead>
              <TableHead>Effective date</TableHead>
              <TableHead>End date</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {extras.map((e) => (
              <TableRow key={e.id}>
                <TableCell>{e.type}</TableCell>
                <TableCell>{money(e.amount)}</TableCell>
                <TableCell>
                  <Badge variant={frequencyBadgeVariant(e.frequency)}>
                    {frequencyLabel(e.frequency)}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {e.frequency === "ONE_TIME" ? "—" : money(monthlyEquivalent(e.amount, e.frequency))}
                </TableCell>
                <TableCell>{new Date(e.date).toLocaleDateString()}</TableCell>
                <TableCell className="text-muted-foreground">
                  {e.endDate ? new Date(e.endDate).toLocaleDateString() : "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">{e.notes || "—"}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(e.id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!loading && extras.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No extras yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {monthlyRecurringTotal > 0 && (
          <p className="text-sm text-muted-foreground">
            Total monthly equivalent (recurring extras):{" "}
            <span className="font-semibold text-foreground">{money(monthlyRecurringTotal)}</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
