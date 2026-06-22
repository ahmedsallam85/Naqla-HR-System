"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

type ImportMessage = { row: number; level: "error" | "warning"; message: string };
type ImportResult = {
  created: number;
  skipped: number;
  messages: ImportMessage[];
};

export function ImportDesignationsDialog() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  function reset() {
    setFile(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleImport() {
    if (!file) return;
    setSubmitting(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/designations/import", {
      method: "POST",
      body: formData,
    });

    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error(body?.error?.toString?.() || "Import failed");
      return;
    }

    const data: ImportResult = await res.json();
    setResult(data);
    if (data.created) {
      toast.success(`Imported ${data.created} position${data.created === 1 ? "" : "s"}`);
      router.refresh();
    } else if (data.skipped === 0) {
      toast.message("No rows to import");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger render={<Button variant="secondary">Import from Excel</Button>} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import positions</DialogTitle>
          <DialogDescription>
            Upload a copy of the designations export (or a sheet with Title /
            Grade / Holder columns). Each row is added as a new position.
          </DialogDescription>
        </DialogHeader>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="text-sm"
        />

        {result && (
          <div className="space-y-2 max-h-64 overflow-y-auto rounded-md border p-3 text-sm">
            <div className="flex gap-2">
              <Badge>{result.created} created</Badge>
              {result.skipped > 0 && (
                <Badge variant="destructive">{result.skipped} skipped</Badge>
              )}
            </div>
            {result.messages.map((m, i) => (
              <p
                key={i}
                className={
                  m.level === "error"
                    ? "text-destructive"
                    : "text-muted-foreground"
                }
              >
                Row {m.row}: {m.message}
              </p>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Close
          </Button>
          <Button onClick={handleImport} disabled={!file || submitting}>
            {submitting ? "Importing..." : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
