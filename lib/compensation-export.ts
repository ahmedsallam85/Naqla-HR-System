import ExcelJS from "exceljs";

const SHEET_NAME = "Bank Transfer";

export type BankTransferRow = {
  employeeCode: string;
  fullName: string;
  bankAccountName: string | null;
  bankAccountNumber: string | null;
  netAmount: number;
};

// Generic column layout -- the real bank's required format is still
// unknown ("criteria to be fed later" per spec). Adjust columns here once
// the actual format is known.
export async function buildBankTransferWorkbook(
  rows: BankTransferRow[],
  periodMonth: number,
  periodYear: number
) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(SHEET_NAME);

  sheet.columns = [
    { header: "Employee Code", key: "employeeCode", width: 16 },
    { header: "Beneficiary Name", key: "beneficiaryName", width: 28 },
    { header: "Bank Account Number", key: "bankAccountNumber", width: 24 },
    { header: "Net Amount", key: "netAmount", width: 16 },
    { header: "Period", key: "period", width: 12 },
  ];
  sheet.getRow(1).font = { bold: true };

  for (const row of rows) {
    sheet.addRow({
      employeeCode: row.employeeCode,
      beneficiaryName: row.bankAccountName || row.fullName,
      bankAccountNumber: row.bankAccountNumber || "",
      netAmount: row.netAmount,
      period: `${periodYear}-${String(periodMonth).padStart(2, "0")}`,
    });
  }

  sheet.getColumn("netAmount").numFmt = "#,##0.00";

  return workbook;
}
