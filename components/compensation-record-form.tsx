"use client";

import { useEffect, useState } from "react";
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
  calculateNetBased,
  DEFAULT_TAX_CONFIG,
  DEFAULT_TAX_BRACKETS,
} from "@/lib/payroll-tax";
import { monthlyEquivalent } from "@/components/compensation-extras-manager";

const CALC_METHODS = [
  { value: "REVERSE", label: "Reverse — I enter the agreed net salary" },
  { value: "STANDARD", label: "Standard — I enter the gross salary" },
  { value: "NET_BASED", label: "Net-based — agreed net, extras included in tax pool" },
] as const;

function money(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

type Extra = { id: string; type: string; amount: number; frequency: string };

export function CompensationRecordForm({ employeeId }: { employeeId: string }) {
  const router = useRouter();
  const [calcMethod, setCalcMethod] = useState<string>("REVERSE");
  const [amount, setAmount] = useState("");
  const [agreedNetAllowances, setAgreedNetAllowances] = useState("0");
  const [compaRatio, setCompaRatio] = useState("");
  const [lastCommission, setLastCommission] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // NET_BASED: live extras fetched from the employee's extras table
  const [extras, setExtras] = useState<Extra[]>([]);
  const [extrasLoading, setExtrasLoading] = useState(false);

  useEffect(() => {
    if (calcMethod !== "NET_BASED") return;
    setExtrasLoading(true);
    fetch(`/api/compensation/${employeeId}/extras`)
      .then((r) => r.json())
      .then((data: Extra[]) => setExtras(data))
      .catch(() => setExtras([]))
      .finally(() => setExtrasLoading(false));
  }, [calcMethod, employeeId]);

  const amountNum = Number(amount);
  const allowancesNum = Number(agreedNetAllowances) || 0;
  const recurringExtrasTotal = extras.reduce((s, e) => s + monthlyEquivalent(e.amount, e.frequency), 0);

  const netBasedResult =
    amountNum > 0 && calcMethod === "NET_BASED"
      ? calculateNetBased(amountNum, DEFAULT_TAX_CONFIG, DEFAULT_TAX_BRACKETS, recurringExtrasTotal)
      : null;

  const standardResult =
    amountNum > 0 && calcMethod !== "NET_BASED"
      ? calcMethod === "REVERSE"
        ? calculateReverse(amountNum, DEFAULT_TAX_CONFIG, DEFAULT_TAX_BRACKETS, allowancesNum)
        : calculateStandard(amountNum, DEFAULT_TAX_CONFIG, DEFAULT_TAX_BRACKETS, allowancesNum)
      : null;

  const hasResult = netBasedResult !== null || standardResult !== null;

  async function handleSubmit() {
    setSubmitting(true);
    const body = {
      calcMethod,
      amount: amountNum,
      agreedNetAllowances: calcMethod === "NET_BASED" ? recurringExtrasTotal : allowancesNum,
      compaRatio: compaRatio ? Number(compaRatio) : undefined,
      lastCommissionReceivedAmount: lastCommission ? Number(lastCommission) : undefined,
      notes: notes || undefined,
    };

    const res = await fetch(`/api/compensation/${employeeId}/records`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSubmitting(false);

    if (!res.ok) {
      const b = await res.json().catch(() => ({}));
      toast.error(b?.error?.toString?.() || "Failed to save compensation record");
      return;
    }


    toast.success("Compensation record saved");
    router.push(`/compensation/${employeeId}`);
    router.refresh();
  }

  const isNetBased = calcMethod === "NET_BASED";

  function amountLabel() {
    if (calcMethod === "STANDARD") return "Gross salary";
    if (calcMethod === "REVERSE") return "Agreed net basic salary";
    return "Agreed net salary";
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
              <Label htmlFor="amount">{amountLabel()}</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            {!isNetBased && (
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
            )}

            {isNetBased && (
              <div className="space-y-1">
                <Label>Recurring monthly extras</Label>
                <p className="mt-2 text-sm font-semibold">
                  {extrasLoading ? "Loading…" : money(recurringExtrasTotal)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Pulled from the extras table below — all included in the tax pool
                </p>
              </div>
            )}

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
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="optional"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Computed breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {netBasedResult ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              <div>
                <p className="text-xs text-muted-foreground">Net salary</p>
                <p className="text-xl font-bold text-primary">{money(amountNum)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Recurring extras (monthly)</p>
                <p className="text-lg font-semibold">{money(recurringExtrasTotal)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Calculation base</p>
                <p className="text-lg font-semibold">{money(netBasedResult.base)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Social insured salary</p>
                <p>{money(netBasedResult.insured)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Social insurance — employee</p>
                <p>{money(netBasedResult.empSi)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Social insurance — company</p>
                <p>{money(netBasedResult.companySi)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tax pool (annual)</p>
                <p>{money(netBasedResult.taxPoolAnnual)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Salary tax (monthly)</p>
                <p>{money(netBasedResult.monthlyTax)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Salary tax (annual)</p>
                <p>{money(netBasedResult.annualTax)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Martyr fund</p>
                <p>{money(netBasedResult.martyr)}</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-xs text-muted-foreground">Total monthly cost to company</p>
                <p className="text-xl font-bold text-primary">{money(netBasedResult.totalCostMonthly)}</p>
              </div>
            </div>
          ) : standardResult ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              <div>
                <p className="text-xs text-muted-foreground">Total net salary</p>
                <p className="text-xl font-bold text-primary">{money(standardResult.takeHome)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Gross salary</p>
                <p className="text-lg font-semibold">{money(standardResult.gross)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Social insured salary</p>
                <p>{money(standardResult.insured)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Social insurance — employee</p>
                <p>{money(standardResult.empSi)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Social insurance — company</p>
                <p>{money(standardResult.companySi)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Salary tax (monthly)</p>
                <p>{money(standardResult.monthlyTax)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Salary tax (annual)</p>
                <p>{money(standardResult.annualTax)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Martyr fund</p>
                <p>{money(standardResult.martyr)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total cost to company</p>
                <p>{money(standardResult.totalCost)}</p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Enter an amount to see the computed breakdown.</p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={submitting || !hasResult}>
          Save compensation record
        </Button>
      </div>
    </div>
  );
}
