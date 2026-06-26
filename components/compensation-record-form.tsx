"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  calculateStandard,
  calculateReverse,
  DEFAULT_TAX_CONFIG,
  DEFAULT_TAX_BRACKETS,
} from "@/lib/payroll-tax";

const CALC_METHODS = [
  { value: "REVERSE", label: "Reverse — I enter the agreed net salary" },
  { value: "STANDARD", label: "Standard — I enter the gross salary" },
] as const;

function money(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function CompensationRecordForm({ employeeId }: { employeeId: string }) {
  const router = useRouter();
  const [calcMethod, setCalcMethod] = useState<string>("REVERSE");
  const [amount, setAmount] = useState("");
  const [agreedNetAllowances, setAgreedNetAllowances] = useState("0");
  const [compaRatio, setCompaRatio] = useState("");
  const [lastCommission, setLastCommission] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const amountNum = Number(amount);
  const allowancesNum = Number(agreedNetAllowances) || 0;
  const result =
    amountNum > 0
      ? calcMethod === "REVERSE"
        ? calculateReverse(amountNum, DEFAULT_TAX_CONFIG, DEFAULT_TAX_BRACKETS, allowancesNum)
        : calculateStandard(amountNum, DEFAULT_TAX_CONFIG, DEFAULT_TAX_BRACKETS, allowancesNum)
      : null;

  async function handleSubmit() {
    setSubmitting(true);
    const res = await fetch(`/api/compensation/${employeeId}/records`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        calcMethod,
        amount: amountNum,
        agreedNetAllowances: allowancesNum,
        compaRatio: compaRatio ? Number(compaRatio) : undefined,
        lastCommissionReceivedAmount: lastCommission ? Number(lastCommission) : undefined,
        notes: notes || undefined,
      }),
    });
    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error(body?.error?.toString?.() || "Failed to save compensation record");
      return;
    }

    toast.success("Compensation record saved");
    router.push(`/compensation/${employeeId}`);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Agreed package</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="calcMethod">Calculation method</Label>
            <Select value={calcMethod} onValueChange={(v) => setCalcMethod(v ?? "REVERSE")}>
              <SelectTrigger id="calcMethod" className="w-full sm:w-96">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CALC_METHODS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <Label htmlFor="amount">{calcMethod === "REVERSE" ? "Agreed net basic salary" : "Gross salary"}</Label>
              <Input id="amount" type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="agreedNetAllowances">Agreed net allowances</Label>
              <Input
                id="agreedNetAllowances"
                type="number"
                min="0"
                value={agreedNetAllowances}
                onChange={(e) => setAgreedNetAllowances(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="compaRatio">Compa ratio</Label>
              <Input
                id="compaRatio"
                type="number"
                step="0.01"
                value={compaRatio}
                onChange={(e) => setCompaRatio(e.target.value)}
                placeholder="optional"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="lastCommission">Last commission received</Label>
              <Input
                id="lastCommission"
                type="number"
                min="0"
                value={lastCommission}
                onChange={(e) => setLastCommission(e.target.value)}
                placeholder="optional"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="optional" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Computed breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              <div>
                <p className="text-xs text-muted-foreground">Total net salary</p>
                <p className="text-xl font-bold text-primary">{money(result.takeHome)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Gross salary</p>
                <p className="text-lg font-semibold">{money(result.gross)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Social insured salary</p>
                <p>{money(result.insured)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Social insurance — employee</p>
                <p>{money(result.empSi)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Social insurance — company</p>
                <p>{money(result.companySi)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Salary tax (monthly)</p>
                <p>{money(result.monthlyTax)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Salary tax (annual)</p>
                <p>{money(result.annualTax)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Martyr fund</p>
                <p>{money(result.martyr)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total cost to company</p>
                <p>{money(result.totalCost)}</p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Enter an amount to see the computed breakdown.</p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={submitting || !result}>
          Save compensation record
        </Button>
      </div>
    </div>
  );
}
