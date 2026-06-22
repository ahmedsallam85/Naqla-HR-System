"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
  SECTIONS,
  QUESTIONS,
  PRIORITY_INFO,
  computeSectionScores,
  computeTotal,
  computePriority,
} from "@/lib/critical-assessment";

const SCALE = [0, 1, 2, 3, 4, 5];

export function CriticalAssessmentForm({ designationId }: { designationId: string }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>(
    Object.fromEntries(QUESTIONS.map((q) => [q.id, ""]))
  );
  const [submitting, setSubmitting] = useState(false);

  const allAnswered = QUESTIONS.every((q) => answers[q.id] !== "");
  const scores = QUESTIONS.map((q) => (answers[q.id] !== "" ? Number(answers[q.id]) : 0));
  const sectionScores = computeSectionScores(scores);
  const total = computeTotal(scores);
  const priority = computePriority(total);

  async function handleSubmit() {
    if (!allAnswered) return;
    setSubmitting(true);

    const res = await fetch(`/api/designations/${designationId}/assessments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scores }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error(body?.error?.toString?.() || "Failed to save assessment");
      return;
    }

    toast.success("Assessment saved");
    router.push(`/critical-positions/${designationId}`);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {SECTIONS.map((section) => {
        const questions = QUESTIONS.filter((q) => q.section === section.id);
        return (
          <Card key={section.id}>
            <CardHeader>
              <CardTitle className="text-base">
                {section.label}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  (max {section.max})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {questions.map((q) => (
                <div key={q.id} className="space-y-2">
                  <Label htmlFor={q.id}>{q.label}</Label>
                  <Select
                    value={answers[q.id]}
                    onValueChange={(v) => setAnswers((prev) => ({ ...prev, [q.id]: v ?? "" }))}
                  >
                    <SelectTrigger id={q.id} className="w-full sm:w-48">
                      <SelectValue placeholder="Score 0-5..." />
                    </SelectTrigger>
                    <SelectContent>
                      {SCALE.map((s) => (
                        <SelectItem key={s} value={String(s)}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
              <p className="text-sm text-muted-foreground">
                Section subtotal: {sectionScores[section.id - 1]} / {section.max}
              </p>
            </CardContent>
          </Card>
        );
      })}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Result</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-6">
          <div>
            <p className="text-xs text-muted-foreground">Total score</p>
            <p className="text-2xl font-bold">{total} / 65</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Priority</p>
            <Badge
              variant={
                priority === "IMPERATIVE"
                  ? "destructive"
                  : priority === "IMPORTANT"
                    ? "default"
                    : "secondary"
              }
              className="text-sm"
            >
              {PRIORITY_INFO[priority].label} ({PRIORITY_INFO[priority].action})
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={!allAnswered || submitting}>
          {submitting ? "Saving..." : "Save assessment"}
        </Button>
      </div>
    </div>
  );
}
