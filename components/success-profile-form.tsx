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

const CRITERIA_FIELDS = [
  { key: "edu", label: "Education" },
  { key: "exp1", label: "Experience 1" },
  { key: "exp2", label: "Experience 2" },
  { key: "exp3", label: "Experience 3" },
  { key: "know", label: "Knowledge" },
  { key: "sk1", label: "Skill 1" },
  { key: "sk2", label: "Skill 2" },
  { key: "sk3", label: "Skill 3" },
  { key: "sk4", label: "Skill 4" },
  { key: "duty1", label: "Duty 1" },
  { key: "duty2", label: "Duty 2" },
  { key: "duty3", label: "Duty 3" },
  { key: "duty4", label: "Duty 4" },
  { key: "duty5", label: "Duty 5" },
];

const LEADERSHIP_FIELDS = [
  { key: "leadCur", label: "Leadership — Current" },
  { key: "leadFut", label: "Leadership — Future" },
  { key: "coreCur", label: "Core Role — Current" },
  { key: "coreFut", label: "Core Role — Future" },
  { key: "ei", label: "Emotional Intelligence" },
  { key: "otherCur", label: "Other — Current" },
  { key: "otherFut", label: "Other — Future" },
];

type ProfileData = {
  incumbent?: string | null;
  year?: string | null;
  location?: string | null;
  level?: string | null;
  area?: string | null;
  urgency?: number | null;
  criteria?: Record<string, string> | null;
  leadership?: Record<string, string> | null;
};

export function SuccessProfileForm({
  designationId,
  initial,
}: {
  designationId: string;
  initial: ProfileData | null;
}) {
  const router = useRouter();
  const [incumbent, setIncumbent] = useState(initial?.incumbent ?? "");
  const [year, setYear] = useState(initial?.year ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [level, setLevel] = useState(initial?.level ?? "");
  const [area, setArea] = useState(initial?.area ?? "");
  const [urgency, setUrgency] = useState(initial?.urgency ? String(initial.urgency) : "");
  const [criteria, setCriteria] = useState<Record<string, string>>(initial?.criteria ?? {});
  const [leadership, setLeadership] = useState<Record<string, string>>(initial?.leadership ?? {});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const res = await fetch(`/api/designations/${designationId}/success-profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        incumbent,
        year,
        location,
        level,
        area,
        urgency: urgency ? Number(urgency) : undefined,
        criteria,
        leadership,
      }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error(body?.error?.toString?.() || "Failed to save success profile");
      return;
    }

    toast.success("Success profile saved");
    router.push(`/critical-positions/${designationId}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Overview</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="incumbent">Incumbent</Label>
            <Input id="incumbent" value={incumbent} onChange={(e) => setIncumbent(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="year">Eligibility year</Label>
            <Input id="year" value={year} onChange={(e) => setYear(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="urgency">Urgency (1-5)</Label>
            <Select value={urgency} onValueChange={(v) => setUrgency(v ?? "")}>
              <SelectTrigger id="urgency" className="w-full">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="level">Level</Label>
            <Input id="level" value={level} onChange={(e) => setLevel(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="area">Area</Label>
            <Input id="area" value={area} onChange={(e) => setArea(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Position criteria</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {CRITERIA_FIELDS.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={field.key}>{field.label}</Label>
              <Textarea
                id={field.key}
                rows={2}
                value={criteria[field.key] ?? ""}
                onChange={(e) =>
                  setCriteria((prev) => ({ ...prev, [field.key]: e.target.value }))
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Leadership profile</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {LEADERSHIP_FIELDS.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={field.key}>{field.label}</Label>
              <Textarea
                id={field.key}
                rows={2}
                value={leadership[field.key] ?? ""}
                onChange={(e) =>
                  setLeadership((prev) => ({ ...prev, [field.key]: e.target.value }))
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Save success profile"}
        </Button>
      </div>
    </form>
  );
}
