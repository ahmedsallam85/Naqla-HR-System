"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { PayrollEmployee } from "@/app/(app)/compensation/payroll/[year]/[month]/page";

type LineItem = { id: string; label: string; amount: number; notes?: string | null };

function money(n: number) {
  return n.toLocaleString("en-EG", { maximumFractionDigits: 2 });
}

// ── Inline row for an existing item ─────────────────────────────────────────

function ItemRow({
  item,
  apiPrefix,
  onDeleted,
}: {
  item: LineItem;
  apiPrefix: string;
  onDeleted: (id: string) => void;
}) {
  const [pending, startTransition] = useTransition();

  function remove() {
    startTransition(async () => {
      const res = await fetch(`${apiPrefix}/${item.id}`, { method: "DELETE" });
      if (res.ok) {
        onDeleted(item.id);
      } else {
        toast.error("Failed to delete item");
      }
    });
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="flex-1 truncate">{item.label}</span>
      <span className="font-mono tabular-nums">{money(item.amount)}</span>
      <button
        type="button"
        onClick={remove}
        disabled={pending}
        className="text-muted-foreground hover:text-destructive"
      >
        <Trash2Icon className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ── Add-new form ─────────────────────────────────────────────────────────────

function AddItemForm({
  onAdded,
  payload,
}: {
  onAdded: (item: LineItem) => void;
  payload: Record<string, unknown>;
}) {
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim() || !amount) return;
    startTransition(async () => {
      const body = { ...payload, label: label.trim(), amount: parseFloat(amount) };
      const apiPath =
        "employeeId" in payload && "type" in payload
          ? "/api/payroll/month-items"
          : "/api/payroll/fixed-additions";
      const res = await fetch(apiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const created = await res.json();
        onAdded({ id: created.id, label: created.label, amount: created.amount });
        setLabel("");
        setAmount("");
      } else {
        toast.error("Failed to add item");
      }
    });
  }

  return (
    <form onSubmit={submit} className="flex items-end gap-2">
      <div className="flex-1 space-y-1">
        <Label className="text-xs">Label</Label>
        <Input
          className="h-8 text-xs"
          placeholder="e.g. Housing Allowance"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
      </div>
      <div className="w-28 space-y-1">
        <Label className="text-xs">Amount (EGP)</Label>
        <Input
          className="h-8 text-xs"
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <Button type="submit" size="sm" disabled={pending} className="h-8">
        <PlusIcon className="h-3.5 w-3.5" />
      </Button>
    </form>
  );
}

// ── Section ──────────────────────────────────────────────────────────────────

function Section({
  title,
  items,
  setItems,
  apiPrefix,
  addPayload,
}: {
  title: string;
  items: LineItem[];
  setItems: (fn: (prev: LineItem[]) => LineItem[]) => void;
  apiPrefix: string;
  addPayload: Record<string, unknown>;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      {items.length === 0 && (
        <p className="text-xs text-muted-foreground">No items yet.</p>
      )}
      {items.map((item) => (
        <ItemRow
          key={item.id}
          item={item}
          apiPrefix={apiPrefix}
          onDeleted={(id) => setItems((prev) => prev.filter((i) => i.id !== id))}
        />
      ))}
      <AddItemForm
        payload={addPayload}
        onAdded={(item) => setItems((prev) => [...prev, item])}
      />
    </div>
  );
}

// ── Main dialog ──────────────────────────────────────────────────────────────

export function PayrollLineItemsDialog({
  emp,
  year,
  month,
  trigger,
}: {
  emp: PayrollEmployee;
  year: number;
  month: number;
  trigger: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const [fixedItems, setFixedItems] = useState<LineItem[]>(
    emp.fixedAdditions.map((f) => ({ id: f.id, label: f.label, amount: f.amount }))
  );
  const [varItems, setVarItems] = useState<LineItem[]>(emp.variableAdditions);
  const [dedItems, setDedItems] = useState<LineItem[]>(emp.deductions);

  function handleClose() {
    setOpen(false);
    router.refresh();
  }

  function handleOpenChange(v: boolean) {
    if (!v) handleClose();
    else setOpen(true);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<span />}>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{emp.fullName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto py-1 pr-1">
          <Section
            title="Fixed Additions (recurring every month)"
            items={fixedItems}
            setItems={setFixedItems as (fn: (prev: LineItem[]) => LineItem[]) => void}
            apiPrefix="/api/payroll/fixed-additions"
            addPayload={{ employeeId: emp.id }}
          />

          <Separator />

          <Section
            title="Variable Additions (this month only)"
            items={varItems}
            setItems={setVarItems as (fn: (prev: LineItem[]) => LineItem[]) => void}
            apiPrefix="/api/payroll/month-items"
            addPayload={{ employeeId: emp.id, year, month, type: "VARIABLE_ADDITION" }}
          />

          <Separator />

          <Section
            title="Deductions (this month only)"
            items={dedItems}
            setItems={setDedItems as (fn: (prev: LineItem[]) => LineItem[]) => void}
            apiPrefix="/api/payroll/month-items"
            addPayload={{ employeeId: emp.id, year, month, type: "DEDUCTION" }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
