// Egyptian payroll tax engine -- ported from the sister project's
// `modules/tax_engine.py` (hr-payroll-saas), which was verified against
// "Egypt_Tax_Reference_v5" golden values. Same formulas, same default
// brackets: both companies are Egyptian and fall under the same tax law.
//
// Two entry points:
//   calculateStandard(gross, ...)            -- input is the gross salary
//   calculateReverse(targetNetBasic, ...)     -- binary-search for the gross
//                                                that produces targetNetBasic
//
// Allowances semantics (from the spec): cash allowances are TAXABLE but NOT
// INSURABLE -- they sit in the income-tax base and the martyr-fund base, but
// the insured-salary cap ignores them.
//
// `cfg` mirrors the Python tax_config row; `brackets` mirrors tax_bracket
// rows ordered by sortOrder. `bracketTo: null` marks the unlimited top tier.

export type TaxConfig = {
  annualExemption: number;
  maxInsured: number;
  insuredDivisor: number;
  empRate: number;
  companyRate: number;
  martyrRate: number;
};

export type TaxBracket = {
  sortOrder: number;
  bracketTo: number | null;
  rate: number;
  baseAdd: number;
  minusFrom: number;
};

export type PayrollTaxResult = {
  gross: number;
  insured: number;
  empSi: number;
  companySi: number;
  salaryTaxable: number;
  allowancesAnnual: number;
  totalTaxable: number;
  annualTax: number;
  monthlyTax: number;
  martyr: number;
  officialNet: number;
  allowancesMonthly: number;
  takeHome: number;
  totalCost: number;
};

export function annualTax(taxable: number, brackets: TaxBracket[]): number {
  if (taxable <= 0) return 0;
  const sorted = [...brackets].sort((a, b) => a.sortOrder - b.sortOrder);
  for (const b of sorted) {
    if (b.bracketTo === null || taxable <= b.bracketTo) {
      return Math.max(0, taxable - b.minusFrom) * b.rate + b.baseAdd;
    }
  }
  return 0;
}

function core(
  gross: number,
  cfg: TaxConfig,
  brackets: TaxBracket[],
  allowancesMonthly = 0
): Omit<PayrollTaxResult, "totalCost"> {
  const mex = cfg.annualExemption / 12;
  const allowancesAnnual = allowancesMonthly * 12;

  const insured = Math.min(gross / cfg.insuredDivisor, cfg.maxInsured);
  const empSi = insured * cfg.empRate;
  const companySi = insured * cfg.companyRate;

  const salaryTaxable = Math.max(0, (gross - empSi - mex) * 12);
  const totalTaxable = salaryTaxable + allowancesAnnual;

  const aTax = annualTax(totalTaxable, brackets);
  const mTax = aTax / 12;
  const martyr = (gross + allowancesMonthly) * cfg.martyrRate;
  const officialNet = gross - empSi - mTax - martyr;

  return {
    gross,
    insured,
    empSi,
    companySi,
    salaryTaxable,
    allowancesAnnual,
    totalTaxable,
    annualTax: aTax,
    monthlyTax: mTax,
    martyr,
    officialNet,
    allowancesMonthly,
    takeHome: officialNet + allowancesMonthly,
  };
}

export function calculateStandard(
  gross: number,
  cfg: TaxConfig,
  brackets: TaxBracket[],
  allowancesMonthly = 0
): PayrollTaxResult {
  const r = core(gross, cfg, brackets, allowancesMonthly);
  return { ...r, totalCost: gross + r.companySi + allowancesMonthly };
}

// Binary-search for the gross such that officialNet == targetNetBasic.
// officialNet is monotonically increasing in gross, so this is safe.
// Allowances MUST be inside the income-tax and martyr-tax bases during the
// solve (matches the Python implementation).
export function calculateReverse(
  targetNetBasic: number,
  cfg: TaxConfig,
  brackets: TaxBracket[],
  allowancesMonthly = 0
): PayrollTaxResult {
  let lo = 0;
  let hi = Math.max(targetNetBasic * 4, 1000);
  let mid = (lo + hi) / 2;
  for (let i = 0; i < 200; i++) {
    mid = (lo + hi) / 2;
    const n = core(mid, cfg, brackets, allowancesMonthly).officialNet;
    if (Math.abs(n - targetNetBasic) <= 1e-7) break;
    if (n < targetNetBasic) lo = mid;
    else hi = mid;
  }
  const r = core(mid, cfg, brackets, allowancesMonthly);
  return { ...r, totalCost: mid + r.companySi + allowancesMonthly };
}

export type NetBasedPayrollResult = {
  base: number;          // agreedNet / 3 * factor; used like gross for SI + tax
  insured: number;
  empSi: number;
  companySi: number;
  taxPoolAnnual: number; // annual taxable = salary taxable + recurring extras * 12
  annualTax: number;
  monthlyTax: number;
  martyr: number;
  totalCostMonthly: number; // full monthly burden: net + extras + empSi + companySi + tax + martyr
};

// NET_BASED calc method:
//   1. base = agreedNet / 3; if base < 15_000 → base *= 2 else base *= 1.5
//   2. SI + tax are derived from base (treated as the gross equivalent)
//   3. recurringExtras are added to the annual tax pool
//   4. totalCostMonthly = agreedNet + recurringExtras + empSi + companySi + monthlyTax + martyr
export function calculateNetBased(
  agreedNet: number,
  cfg: TaxConfig,
  brackets: TaxBracket[],
  recurringExtras = 0,
): NetBasedPayrollResult {
  const third = agreedNet / 3;
  const base = third < 15_000 ? third * 2 : third * 1.5;

  const insured = Math.min(base / cfg.insuredDivisor, cfg.maxInsured);
  const empSi = insured * cfg.empRate;
  const companySi = insured * cfg.companyRate;

  const mex = cfg.annualExemption / 12;
  const salaryTaxable = Math.max(0, (base - empSi - mex) * 12);
  const taxPoolAnnual = salaryTaxable + recurringExtras * 12;

  const aTax = annualTax(taxPoolAnnual, brackets);
  const monthlyTax = aTax / 12;
  const martyr = (base + recurringExtras) * cfg.martyrRate;

  const totalCostMonthly = agreedNet + recurringExtras + empSi + companySi + monthlyTax + martyr;

  return { base, insured, empSi, companySi, taxPoolAnnual, annualTax: aTax, monthlyTax, martyr, totalCostMonthly };
}

export const DEFAULT_TAX_CONFIG: TaxConfig = {
  annualExemption: 20000,
  maxInsured: 16700,
  insuredDivisor: 1.3,
  empRate: 0.11,
  companyRate: 0.1875,
  martyrRate: 0.0005,
};

export const DEFAULT_TAX_BRACKETS: TaxBracket[] = [
  { sortOrder: 1, bracketTo: 40000, rate: 0.0, baseAdd: 0, minusFrom: 0 },
  { sortOrder: 2, bracketTo: 55000, rate: 0.1, baseAdd: 0, minusFrom: 40000 },
  { sortOrder: 3, bracketTo: 70000, rate: 0.15, baseAdd: 1500, minusFrom: 55000 },
  { sortOrder: 4, bracketTo: 200000, rate: 0.2, baseAdd: 3750, minusFrom: 70000 },
  { sortOrder: 5, bracketTo: 400000, rate: 0.225, baseAdd: 29750, minusFrom: 200000 },
  { sortOrder: 6, bracketTo: 600000, rate: 0.25, baseAdd: 74750, minusFrom: 400000 },
  { sortOrder: 7, bracketTo: 700000, rate: 0.25, baseAdd: 78750, minusFrom: 400000 },
  { sortOrder: 8, bracketTo: 800000, rate: 0.25, baseAdd: 81500, minusFrom: 400000 },
  { sortOrder: 9, bracketTo: 900000, rate: 0.25, baseAdd: 85000, minusFrom: 400000 },
  { sortOrder: 10, bracketTo: 1200000, rate: 0.25, baseAdd: 90000, minusFrom: 400000 },
  { sortOrder: 11, bracketTo: null, rate: 0.275, baseAdd: 300000, minusFrom: 1200000 },
];
