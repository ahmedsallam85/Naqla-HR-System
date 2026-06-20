"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LOOKUP_CATEGORIES, type LookupCategoryKey } from "@/lib/lookup-categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type LookupValue = {
  id: string;
  category: string;
  value: string;
  isActive: boolean;
};

export function LookupsManager() {
  const [activeCategory, setActiveCategory] = useState<LookupCategoryKey>(
    LOOKUP_CATEGORIES[0].key
  );
  const [allValues, setAllValues] = useState<LookupValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [newValue, setNewValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadValues() {
    setLoading(true);
    const res = await fetch("/api/admin/lookups");
    if (res.ok) {
      setAllValues(await res.json());
    }
    setLoading(false);
  }

  useEffect(() => {
    loadValues();
  }, []);

  const valuesForCategory = allValues.filter(
    (v) => v.category === activeCategory
  );

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newValue.trim()) return;
    setSubmitting(true);

    const res = await fetch("/api/admin/lookups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: activeCategory, value: newValue.trim() }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error(body?.error?.toString?.() || "Failed to add value");
      return;
    }

    setNewValue("");
    toast.success("Value added");
    loadValues();
  }

  async function toggleActive(item: LookupValue) {
    const res = await fetch(`/api/admin/lookups/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !item.isActive }),
    });
    if (!res.ok) {
      toast.error("Failed to update value");
      return;
    }
    loadValues();
  }

  async function handleDelete(item: LookupValue) {
    if (!confirm(`Delete "${item.value}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/lookups/${item.id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      toast.error("Failed to delete value");
      return;
    }
    toast.success("Value deleted");
    loadValues();
  }

  return (
    <div className="flex gap-6">
      <aside className="w-56 shrink-0 space-y-1">
        {LOOKUP_CATEGORIES.map((cat) => {
          const count = allValues.filter((v) => v.category === cat.key).length;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={cn(
                "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted",
                activeCategory === cat.key && "bg-muted font-medium text-primary"
              )}
            >
              {cat.label}
              <span className="text-xs text-muted-foreground">{count}</span>
            </button>
          );
        })}
      </aside>

      <div className="flex-1 space-y-4">
        <form onSubmit={handleAdd} className="flex gap-2">
          <Input
            placeholder={`Add a new ${LOOKUP_CATEGORIES.find((c) => c.key === activeCategory)?.label.toLowerCase()}...`}
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
          />
          <Button type="submit" disabled={submitting}>
            Add
          </Button>
        </form>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {valuesForCategory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.value}</TableCell>
                    <TableCell>
                      <Badge variant={item.isActive ? "default" : "secondary"}>
                        {item.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleActive(item)}
                      >
                        {item.isActive ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(item)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!loading && valuesForCategory.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center text-muted-foreground"
                    >
                      No values yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
