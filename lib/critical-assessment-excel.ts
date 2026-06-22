import ExcelJS from "exceljs";

const SHEET_NAME = "Designations";
const HEADERS = ["Title", "Grade", "Holder", "Latest Total", "Latest Priority"];

export type DesignationExportRow = {
  title: string;
  grade: string | null;
  holderName: string | null;
  holder: { fullName: string } | null;
  assessments: { total: number; priority: string }[];
};

export async function buildDesignationWorkbook(rows: DesignationExportRow[]) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(SHEET_NAME);
  sheet.columns = HEADERS.map((header) => ({ header, key: header, width: 22 }));
  sheet.getRow(1).font = { bold: true };

  for (const row of rows) {
    const latest = row.assessments[0];
    sheet.addRow({
      Title: row.title,
      Grade: row.grade ?? "",
      Holder: row.holder?.fullName ?? row.holderName ?? "",
      "Latest Total": latest?.total ?? "",
      "Latest Priority": latest?.priority ?? "",
    });
  }

  return workbook;
}

export type ParsedDesignationRow = {
  rowNumber: number;
  title: string;
  grade: string;
  holderName: string;
};

function cellToString(value: ExcelJS.CellValue): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "object" && "text" in (value as object)) {
    return String((value as { text: unknown }).text ?? "");
  }
  return String(value).trim();
}

export async function parseDesignationWorkbook(buffer: Buffer): Promise<ParsedDesignationRow[]> {
  const workbook = new ExcelJS.Workbook();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await workbook.xlsx.load(buffer as any);
  const sheet = workbook.getWorksheet(SHEET_NAME) ?? workbook.worksheets[0];
  if (!sheet) return [];

  const headerRow = sheet.getRow(1);
  const headerToIndex = new Map<string, number>();
  headerRow.eachCell((cell, colNumber) => {
    headerToIndex.set(cellToString(cell.value).trim(), colNumber);
  });

  const rows: ParsedDesignationRow[] = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const get = (header: string) => {
      const idx = headerToIndex.get(header);
      if (!idx) return "";
      return cellToString(row.getCell(idx).value);
    };

    const title = get("Title");
    const grade = get("Grade");
    const holderName = get("Holder");
    if (!title && !grade && !holderName) return;

    rows.push({ rowNumber, title, grade, holderName });
  });

  return rows;
}
