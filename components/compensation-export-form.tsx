"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

const now = new Date();

export function CompensationExportForm() {
  const router = useRouter();
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [submitting, setSubmitting] = useState(false);

  async function handleDownload() {
    setSubmitting(true);
    const res = await fetch("/api/compensation/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month: Number(month), year: Number(year) }),
    });
    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error(body?.error?.toString?.() || "Failed to generate export");
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `naqla-bank-transfer-${year}-${month.padStart(2, "0")}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success("Export generated");
    router.refresh();
  }

  return (
    <Card>
      <CardContent className="flex flex-wrap items-end gap-4 pt-6">
        <div className="space-y-1">
          <Label htmlFor="exportMonth">Month</Label>
          <Input
            id="exportMonth"
            type="number"
            min="1"
            max="12"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-24"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="exportYear">Year</Label>
          <Input
            id="exportYear"
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-28"
          />
        </div>
        <Button onClick={handleDownload} disabled={submitting}>
          {submitting ? "Generating..." : "Download Excel"}
        </Button>
      </CardContent>
    </Card>
  );
}
