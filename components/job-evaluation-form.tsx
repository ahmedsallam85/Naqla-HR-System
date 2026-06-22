"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  KH_TECH,
  KH_FT,
  KH_MGMT,
  KH_MGMT_FT,
  KH_HR,
  PS_TE,
  PS_TC,
  PS_FT,
  ACC_FTA,
  ACC_MAG,
  getAccTypeOptions,
  getKhPoints,
  getKhNotation,
  getKhValidity,
  getPsPoints,
  getPsValidity,
  getAccPoints,
  getAccValidity,
  getHayLevel,
  type Validity,
  type CodeOption,
} from "@/lib/hay-evaluation";

function ValidityBadge({ validity }: { validity: Validity | null }) {
  if (!validity) return null;
  if (validity === "white") {
    return <Badge variant="secondary">Valid combination</Badge>;
  }
  if (validity === "yellow") {
    return (
      <Badge className="border-yellow-500/30 bg-yellow-500/15 text-yellow-600">
        Unusual — needs justification
      </Badge>
    );
  }
  return <Badge variant="destructive">Invalid combination</Badge>;
}

function CodeSelect({
  id,
  label,
  options,
  value,
  onChange,
}: {
  id: string;
  label: string;
  options: CodeOption[];
  value: string;
  onChange: (code: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={(v) => onChange(v ?? "")}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.code || "_standard"} value={o.code || "_standard"}>
              {o.code ? `${o.code} — ${o.label}` : `Standard — ${o.label}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// "" is a valid code (Standard fine-tuning) but shadcn's Select treats "" as
// empty/no-selection, so it's mapped to this sentinel in the UI only.
const STANDARD = "_standard";
function toCode(v: string) {
  return v === STANDARD ? "" : v;
}

export function JobEvaluationForm({ jobRoleId }: { jobRoleId: string }) {
  const router = useRouter();
  const [khTech, setKhTech] = useState("");
  const [khFt, setKhFt] = useState(STANDARD);
  const [khMgmt, setKhMgmt] = useState("");
  const [khMgmtFt, setKhMgmtFt] = useState(STANDARD);
  const [khHr, setKhHr] = useState("");
  const [psTe, setPsTe] = useState("");
  const [psTc, setPsTc] = useState("");
  const [psFt, setPsFt] = useState(STANDARD);
  const [accFta, setAccFta] = useState("");
  const [accMag, setAccMag] = useState("");
  const [accType, setAccType] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const khInput = {
    khTech,
    khFt: toCode(khFt),
    khMgmt,
    khMgmtFt: toCode(khMgmtFt),
    khHr,
  };

  const khPoints = getKhPoints(khInput);
  const khValidity = getKhValidity(khTech || undefined, khMgmt || undefined, khHr || undefined);
  const khNotation = getKhNotation(khInput);

  const psPoints = getPsPoints(khPoints, psTe, psTc, toCode(psFt));
  const psValidity = getPsValidity(psTe || undefined, psTc || undefined);

  const accTypeOptions = getAccTypeOptions(accMag || undefined);
  const accPoints = getAccPoints(accFta, accMag, accType);
  const accValidity = getAccValidity(accFta || undefined, accType || undefined);

  const totalPoints =
    khPoints != null && psPoints != null && accPoints != null
      ? khPoints + psPoints + accPoints
      : null;
  const hayLevel = totalPoints != null ? getHayLevel(totalPoints) ?? "Above Hay 27" : null;

  const allFilled =
    khTech && khMgmt && khHr && psTe && psTc && accFta && accMag && accType;

  function handleMagChange(v: string) {
    setAccMag(v);
    setAccType(""); // options depend on magnitude, mirrors the original tool's reset behavior
  }

  async function handleSubmit() {
    setSubmitting(true);
    const res = await fetch(`/api/job-roles/${jobRoleId}/evaluations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        khTech,
        khFt: toCode(khFt),
        khMgmt,
        khMgmtFt: toCode(khMgmtFt),
        khHr,
        psTe,
        psTc,
        psFt: toCode(psFt),
        accFta,
        accMag,
        accType,
        notes: notes || undefined,
      }),
    });
    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error(body?.error?.toString?.() || "Failed to save evaluation");
      return;
    }

    toast.success("Evaluation saved");
    router.push(`/job-grading/${jobRoleId}`);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Know-How</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <CodeSelect id="khTech" label="Technical depth" options={KH_TECH} value={khTech} onChange={setKhTech} />
            <CodeSelect id="khFt" label="Technical fine-tuning" options={KH_FT} value={khFt} onChange={setKhFt} />
            <CodeSelect id="khMgmt" label="Managerial breadth" options={KH_MGMT} value={khMgmt} onChange={setKhMgmt} />
            <CodeSelect id="khMgmtFt" label="Managerial fine-tuning" options={KH_MGMT_FT} value={khMgmtFt} onChange={setKhMgmtFt} />
            <CodeSelect id="khHr" label="Human relations" options={KH_HR} value={khHr} onChange={setKhHr} />
          </div>
          <div className="flex flex-wrap items-center gap-3 rounded-md bg-muted p-3 text-sm">
            <span className="font-mono">{khNotation}</span>
            <span className="font-semibold">{khPoints ?? "—"} points</span>
            <ValidityBadge validity={khValidity} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Problem Solving</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <CodeSelect id="psTe" label="Thinking environment" options={PS_TE} value={psTe} onChange={setPsTe} />
            <CodeSelect id="psTc" label="Thinking challenge" options={PS_TC} value={psTc} onChange={setPsTc} />
            <CodeSelect id="psFt" label="Fine-tuning" options={PS_FT} value={psFt} onChange={setPsFt} />
          </div>
          <div className="flex flex-wrap items-center gap-3 rounded-md bg-muted p-3 text-sm">
            <span className="font-semibold">{psPoints ?? "—"} points</span>
            <ValidityBadge validity={psValidity} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Accountability</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <CodeSelect id="accFta" label="Freedom to act" options={ACC_FTA} value={accFta} onChange={setAccFta} />
            <CodeSelect id="accMag" label="Magnitude" options={ACC_MAG} value={accMag} onChange={handleMagChange} />
            <CodeSelect id="accType" label="Accountability type" options={accTypeOptions} value={accType} onChange={setAccType} />
          </div>
          <div className="flex flex-wrap items-center gap-3 rounded-md bg-muted p-3 text-sm">
            <span className="font-semibold">{accPoints ?? "—"} points</span>
            <ValidityBadge validity={accValidity} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Result</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <p className="text-xs text-muted-foreground">Total Hay points</p>
              <p className="text-2xl font-bold">{totalPoints ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Hay level</p>
              <p className="text-2xl font-bold text-primary">{hayLevel ?? "—"}</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes / justification</Label>
            <Textarea
              id="notes"
              placeholder="Required when a combination is flagged yellow or blue"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={!allFilled || submitting}>
          {submitting ? "Saving..." : "Save evaluation"}
        </Button>
      </div>
    </div>
  );
}
