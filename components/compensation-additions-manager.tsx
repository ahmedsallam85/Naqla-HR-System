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

const ADDITION_TYPES = [
  { value: "SIGN_ON_BONUS", label: "Sign on bonus" },
  { value: "PERFORMANCE_BONUS", label: "Performance Bonus" },
  { value: "SALARY_ADVANCE", label: "Salary Advance" },
] as const;

function typeLabel(type: string) {
  return ADDITION_TYPES.find((t) => t.value === type)?.label ?? type;
}

type Addition = {
  id: string;
  type: string;
  amount: number;
  date: string;
  notes: string | null;
};

export function CompensationAdditionsManager({ employeeId }: { employeeId: string }) {
  const [additions, setAdditions] = useState<Addition[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [type, setType] = useState<string>(ADDITION_TYPES[0].value);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/compensation/${employeeId}/additions`);
    if (res.ok) setAdditions(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load on mount
    void load();
  }, [employeeId]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || !date) return;
    setSubmitting(true);

    const res = await fetch(`/api/compensation/${employeeId}/additions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, amount: Number(amount), date, notes: notes || undefined }),
    });

    setSubmitting(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error(body?.error?.toString?.() || "Failed to add addition");
      return;
    }

    setAmount("");
    setDate("");
    setNotes("");
    toast.success("Addition added");
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this addition? This cannot be undone.")) return;
    const res = await fetch(`/api/compensation/additions/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to delete addition");
      return;
    }
    toast.success("Addition deleted");
    load();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Additions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleAdd} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="space-y-1">
            <Label htmlFor="additionType">Type</Label>
            <Select value={type} onValueChange={(v) => setType(v ?? ADDITION_TYPES[0].value)}>
              <SelectTrigger id="additionType" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ADDITION_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="additionAmount">Amount</Label>
            <Input id="additionAmount" type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="additionDate">Date</Label>
            <Input id="additionDate" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={submitting} className="w-full">
              Add
            </Button>
          </div>
          <div className="col-span-full space-y-1">
            <Label htmlFor="additionNotes">Notes</Label>
            <Input id="additionNotes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="optional" />
          </div>
        </form>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {additions.map((a) => (
              <TableRow key={a.id}>
                <TableCell>{typeLabel(a.type)}</TableCell>
                <TableCell>{a.amount.toLocaleString()}</TableCell>
                <TableCell>{new Date(a.date).toLocaleDateString()}</TableCell>
                <TableCell className="text-muted-foreground">{a.notes || "—"}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(a.id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!loading && additions.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No additions yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
