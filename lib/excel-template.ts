import ExcelJS from "exceljs";
import { ALL_EMPLOYEE_FIELDS, type FieldConfig } from "@/lib/employee-fields";

const SHEET_NAME = "Employees";
const CODE_HEADER = "Employee Code";
const MANAGER_HEADER = "Reporting Manager Code";

type Column =
  | { kind: "code"; header: string }
  | { kind: "manager"; header: string }
  | { kind: "field"; header: string; field: FieldConfig };

function buildColumns(): Column[] {
  const columns: Column[] = [{ kind: "code", header: CODE_HEADER }];
  for (const field of ALL_EMPLOYEE_FIELDS) {
    columns.push({ kind: "field", header: field.label, field });
    if (field.name === "systemAuthority") {
      // Keep the reporting manager column next to org placement, matching the form layout.
      columns.push({ kind: "manager", header: MANAGER_HEADER });
    }
  }
  return columns;
}

function dateToCell(value: unknown): Date | null {
  if (!value) return null;
  const d = new Date(value as string);
  return Number.isNaN(d.getTime()) ? null : d;
}

function fieldToCellValue(
  field: FieldConfig,
  raw: unknown
): string | number | Date | null {
  if (raw === null || raw === undefined || raw === "") return null;
  if (field.type === "date") return dateToCell(raw);
  if (field.type === "number") return Number(raw);
  if (field.type === "select" && field.options) {
    const match = field.options.find((o) => o.value === raw);
    return match ? match.label : String(raw);
  }
  return String(raw);
}

export type EmployeeExportRow = Record<string, unknown> & {
  employeeCode: string;
  reportingManager?: { employeeCode: string } | null;
};

export async function buildEmployeeWorkbook(employees: EmployeeExportRow[]) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(SHEET_NAME);
  const columns = buildColumns();

  sheet.columns = columns.map((col) => ({
    header: col.header,
    key: col.header,
    width: col.kind === "field" && col.field.type === "text" ? 22 : 18,
  }));
  sheet.getRow(1).font = { bold: true };

  for (const emp of employees) {
    const row: Record<string, unknown> = {};
    for (const col of columns) {
      if (col.kind === "code") {
        row[col.header] = emp.employeeCode;
      } else if (col.kind === "manager") {
        row[col.header] = emp.reportingManager?.employeeCode ?? "";
      } else {
        row[col.header] = fieldToCellValue(col.field, emp[col.field.name]);
      }
    }
    sheet.addRow(row);
  }

  for (const col of columns) {
    if (col.kind === "field" && col.field.type === "date") {
      sheet.getColumn(col.header).numFmt = "yyyy-mm-dd";
    }
  }

  return workbook;
}

export type ParsedRow = {
  rowNumber: number;
  employeeCode: string;
  managerCode: string;
  data: Record<string, string>;
  errors: string[];
};

function cellToString(value: ExcelJS.CellValue): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "object" && "text" in (value as object)) {
    return String((value as { text: unknown }).text ?? "");
  }
  if (typeof value === "object" && "result" in (value as object)) {
    return String((value as { result: unknown }).result ?? "");
  }
  return String(value).trim();
}

function parseFieldCell(field: FieldConfig, raw: string): { value: string; error?: string } {
  if (!raw) return { value: "" };

  if (field.type === "select" && field.options) {
    const normalized = raw.trim().toLowerCase();
    const match = field.options.find(
      (o) => o.label.toLowerCase() === normalized || o.value.toLowerCase() === normalized
    );
    if (!match) {
      return {
        value: "",
        error: `"${raw}" is not a valid value for ${field.label} (expected one of: ${field.options.map((o) => o.label).join(", ")})`,
      };
    }
    return { value: match.value };
  }

  if (field.type === "date") {
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) {
      return { value: "", error: `"${raw}" is not a valid date for ${field.label}` };
    }
    return { value: d.toISOString().slice(0, 10) };
  }

  if (field.type === "number") {
    const n = Number(raw);
    if (Number.isNaN(n)) {
      return { value: "", error: `"${raw}" is not a valid number for ${field.label}` };
    }
    return { value: String(n) };
  }

  return { value: raw };
}

export async function parseEmployeeWorkbook(buffer: Buffer): Promise<ParsedRow[]> {
  const workbook = new ExcelJS.Workbook();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await workbook.xlsx.load(buffer as any);
  const sheet = workbook.getWorksheet(SHEET_NAME) ?? workbook.worksheets[0];
  if (!sheet) return [];

  const columns = buildColumns();
  const headerRow = sheet.getRow(1);
  const headerToIndex = new Map<string, number>();
  headerRow.eachCell((cell, colNumber) => {
    headerToIndex.set(cellToString(cell.value).trim(), colNumber);
  });

  const rows: ParsedRow[] = [];

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    const get = (header: string) => {
      const idx = headerToIndex.get(header);
      if (!idx) return "";
      return cellToString(row.getCell(idx).value);
    };

    const employeeCode = get(CODE_HEADER);
    const managerCode = get(MANAGER_HEADER);
    const data: Record<string, string> = {};
    const errors: string[] = [];

    const isBlankRow =
      !employeeCode &&
      !managerCode &&
      columns.every((c) => c.kind !== "field" || !get(c.header));
    if (isBlankRow) return;

    for (const col of columns) {
      if (col.kind !== "field") continue;
      const raw = get(col.header);
      const { value, error } = parseFieldCell(col.field, raw);
      data[col.field.name] = value;
      if (error) errors.push(error);
    }

    rows.push({ rowNumber, employeeCode, managerCode, data, errors });
  });

  return rows;
}
