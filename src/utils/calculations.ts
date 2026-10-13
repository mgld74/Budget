import { DebtItem, PayoffStrategyResult, FinancialHealthBreakdown, Transaction, CategoryBudget } from '../types/finance';

export function formatCurrency(amount: number, symbol: string = '$'): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return `${symbol}0`;
  }
  return `${symbol}${amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: amount % 1 !== 0 && Math.abs(amount) < 100 ? 2 : 0,
  })}`;
}

export function formatPercent(val: number): string {
  if (isNaN(val)) return '0%';
  return `${Math.round(val)}%`;
}

// Calculate Debt Payoff schedules: Avalanche vs Snowball
export function calculateDebtPayoff(
  debts: DebtItem[],
  extraMonthlyPayment: number = 0,
  strategy: 'avalanche' | 'snowball' = 'avalanche'
): PayoffStrategyResult {
  if (!debts || debts.length === 0) {
    return {
      strategy,
      totalMonths: 0,
      totalInterestPaid: 0,
      payoffDate: 'Debt Free Today!',
      monthlySchedule: [],
    };
  }

  // Deep clone debts
  let workingDebts = debts.map(d => ({
    ...d,
    currentBalance: Math.max(0, d.balance),
    monthlyRate: (d.interestRate / 100) / 12,
  })).filter(d => d.currentBalance > 0);

  if (workingDebts.length === 0) {
    return {
      strategy,
      totalMonths: 0,
      totalInterestPaid: 0,
      payoffDate: 'Debt Free Today!',
      monthlySchedule: [],
    };
  }

  const baseMinTotal = workingDebts.reduce((sum, d) => sum + d.minimumPayment, 0);
  const totalMonthlyBudget = baseMinTotal + extraMonthlyPayment;

  let totalInterestAccumulated = 0;
  let month = 0;
  const maxMonths = 360; // 30 years limit
  const schedule: {
    month: number;
    yearMonth: string;
    remainingBalance: number;
    interestPaid: number;
    principalPaid: number;
  }[] = [];

  const startDate = new Date();

  while (workingDebts.some(d => d.currentBalance > 0.01) && month < maxMonths) {
    month++;
    let monthInterest = 0;
    let monthPrincipal = 0;

    // 1. Accrue interest on all debts
    for (const d of workingDebts) {
      if (d.currentBalance > 0.01) {
        const interest = d.currentBalance * d.monthlyRate;
        d.currentBalance += interest;
        monthInterest += interest;
        totalInterestAccumulated += interest;
      }
    }

    // 2. Pay minimums first
    let availableBudget = totalMonthlyBudget;
    for (const d of workingDebts) {
      if (d.currentBalance > 0.01) {
        const payment = Math.min(d.currentBalance, d.minimumPayment);
        d.currentBalance -= payment;
        monthPrincipal += (payment - (d.currentBalance > 0 ? 0 : 0)); // portion toward debt
        availableBudget -= payment;
      }
    }

    // 3. Sort active debts by strategy for remaining rollover cash
    // Avalanche: Highest interest rate first
    // Snowball: Lowest balance first
    const activeDebts = workingDebts.filter(d => d.currentBalance > 0.01);
    if (strategy === 'avalanche') {
      activeDebts.sort((a, b) => b.interestRate - a.interestRate);
    } else {
      activeDebts.sort((a, b) => a.currentBalance - b.currentBalance);
    }

    // Apply extra available cash to prioritized debt
    if (availableBudget > 0 && activeDebts.length > 0) {
      for (const d of activeDebts) {
        if (availableBudget <= 0) break;
        const extraPay = Math.min(d.currentBalance, availableBudget);
        d.currentBalance -= extraPay;
        monthPrincipal += extraPay;
        availableBudget -= extraPay;
      }
    }

    const currentTotalBalance = workingDebts.reduce((sum, d) => sum + Math.max(0, d.currentBalance), 0);
    
    // Future date format
    const currDate = new Date(startDate.getFullYear(), startDate.getMonth() + month, 1);
    const monthStr = currDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    schedule.push({
      month,
      yearMonth: monthStr,
      remainingBalance: Math.round(currentTotalBalance),
      interestPaid: Math.round(monthInterest),
      principalPaid: Math.round(monthPrincipal),
    });

    if (currentTotalBalance <= 0.01) {
      break;
    }
  }

  const finalDate = new Date(startDate.getFullYear(), startDate.getMonth() + month, 1);
  const payoffDate = finalDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return {
    strategy,
    totalMonths: month,
    totalInterestPaid: Math.round(totalInterestAccumulated),
    payoffDate,
    monthlySchedule: schedule,
  };
}

// Calculate 50/30/20 & Category Totals from Transactions & Budgets
export function calculateBudgetStats(
  income: number,
  categoryBudgets: CategoryBudget[],
  transactions: Transaction[]
) {
  const currentMonthTransactions = transactions.filter(t => {
    // Recent 30 days or current active period
    return t.type !== 'income';
  });

  const spentByCategory: Record<string, number> = {};
  let totalNeedsSpent = 0;
  let totalWantsSpent = 0;
  let totalSavingsSpent = 0;
  let totalDebtSpent = 0;

  for (const t of currentMonthTransactions) {
    spentByCategory[t.category] = (spentByCategory[t.category] || 0) + t.amount;
    if (t.type === 'needs') totalNeedsSpent += t.amount;
    else if (t.type === 'wants') totalWantsSpent += t.amount;
    else if (t.type === 'savings') totalSavingsSpent += t.amount;
    else if (t.type === 'debt') totalDebtSpent += t.amount;
  }

  const budgetedNeeds = categoryBudgets.filter(b => b.type === 'needs').reduce((s, b) => s + b.budgetLimit, 0);
  const budgetedWants = categoryBudgets.filter(b => b.type === 'wants').reduce((s, b) => s + b.budgetLimit, 0);
  const budgetedSavings = categoryBudgets.filter(b => b.type === 'savings').reduce((s, b) => s + b.budgetLimit, 0);
  const budgetedDebt = categoryBudgets.filter(b => b.type === 'debt').reduce((s, b) => s + b.budgetLimit, 0);

  const totalMonthlySpent = totalNeedsSpent + totalWantsSpent + totalDebtSpent;
  const totalMonthlySavingsActual = totalSavingsSpent + Math.max(0, income - (totalNeedsSpent + totalWantsSpent + totalDebtSpent + totalSavingsSpent));
  const savingsRate = income > 0 ? (totalMonthlySavingsActual / income) * 100 : 0;

  const needsPercent = income > 0 ? (totalNeedsSpent / income) * 100 : 0;
  const wantsPercent = income > 0 ? (totalWantsSpent / income) * 100 : 0;
  const savingsPercent = income > 0 ? (totalMonthlySavingsActual / income) * 100 : 0;

  return {
    spentByCategory,
    totalNeedsSpent,
    totalWantsSpent,
    totalSavingsSpent,
    totalDebtSpent,
    totalMonthlySpent,
    budgetedNeeds,
    budgetedWants,
    budgetedSavings,
    budgetedDebt,
    monthlySurplus: Math.max(0, income - (totalNeedsSpent + totalWantsSpent + totalDebtSpent + totalSavingsSpent)),
    savingsRate,
    needsPercent,
    wantsPercent,
    savingsPercent,
  };
}

// Compute Comprehensive Financial Health Score (0 - 100)
export function calculateHealthScore(
  monthlyIncome: number,
  monthlyNeeds: number,
  monthlyWants: number,
  liquidSavings: number,
  totalDebt: number,
  investments: number
): FinancialHealthBreakdown {
  const safeIncome = Math.max(1, monthlyIncome);
  const essentialMonthlyExpenses = Math.max(100, monthlyNeeds);
  const runwayMonths = liquidSavings / essentialMonthlyExpenses;
  const monthlySurplus = Math.max(0, safeIncome - (monthlyNeeds + monthlyWants));
  const savingsRate = (monthlySurplus / safeIncome) * 100;
  const totalNetWorth = (liquidSavings + investments) - totalDebt;

  // 1. Savings Rate Score (0 - 30 points)
  // Target: >= 20% gets 30, >= 15% gets 24, >= 10% gets 18
  let savingsRateScore = 0;
  if (savingsRate >= 25) savingsRateScore = 30;
  else if (savingsRate >= 20) savingsRateScore = 26;
  else if (savingsRate >= 15) savingsRateScore = 20;
  else if (savingsRate >= 10) savingsRateScore = 14;
  else if (savingsRate > 0) savingsRateScore = 8;

  // 2. Emergency Runway Score (0 - 30 points)
  // Target: 6 months gets 30, 3-5 months gets 24, 1-2 months gets 14
  let emergencyRunwayScore = 0;
  if (runwayMonths >= 6) emergencyRunwayScore = 30;
  else if (runwayMonths >= 4.5) emergencyRunwayScore = 26;
  else if (runwayMonths >= 3) emergencyRunwayScore = 22;
  else if (runwayMonths >= 1.5) emergencyRunwayScore = 14;
  else if (runwayMonths >= 0.5) emergencyRunwayScore = 8;
  else emergencyRunwayScore = 3;

  // 3. Needs & Wants Balance Score (0 - 25 points)
  // Needs should ideally be <= 50%, Wants <= 30%
  const needsRatio = monthlyNeeds / safeIncome;
  const wantsRatio = monthlyWants / safeIncome;
  let needsWantsRatioScore = 25;
  if (needsRatio > 0.6) needsWantsRatioScore -= 8;
  else if (needsRatio > 0.5) needsWantsRatioScore -= 4;
  if (wantsRatio > 0.35) needsWantsRatioScore -= 7;
  else if (wantsRatio > 0.3) needsWantsRatioScore -= 3;
  needsWantsRatioScore = Math.max(5, needsWantsRatioScore);

  // 4. Debt Burden Score (0 - 15 points)
  const debtToIncome = totalDebt / (safeIncome * 12);
  let debtBurdenScore = 15;
  if (totalDebt === 0) debtBurdenScore = 15;
  else if (debtToIncome < 0.2) debtBurdenScore = 12;
  else if (debtToIncome < 0.5) debtBurdenScore = 9;
  else if (debtToIncome < 1.0) debtBurdenScore = 6;
  else debtBurdenScore = 2;

  const totalScore = Math.min(100, Math.max(10, Math.round(savingsRateScore + emergencyRunwayScore + needsWantsRatioScore + debtBurdenScore)));

  let grade: 'A+' | 'A' | 'B' | 'C' | 'D' = 'C';
  if (totalScore >= 90) grade = 'A+';
  else if (totalScore >= 80) grade = 'A';
  else if (totalScore >= 68) grade = 'B';
  else if (totalScore >= 50) grade = 'C';
  else grade = 'D';

  return {
    score: totalScore,
    grade,
    savingsRateScore,
    emergencyRunwayScore,
    needsWantsRatioScore,
    debtBurdenScore,
    runwayMonths: Number(runwayMonths.toFixed(1)),
    savingsRate: Number(savingsRate.toFixed(1)),
    monthlySurplus,
    totalNetWorth,
  };
}

// Wealth & Compound Growth projection
export function calculateWealthProjection(
  currentNetWorth: number,
  monthlyContribution: number,
  annualReturnRate: number = 7, // percentage
  inflationRate: number = 2.5, // percentage
  yearsToProject: number = 30
) {
  const nominalMonthlyRate = (annualReturnRate / 100) / 12;
  const realMonthlyRate = ((annualReturnRate - inflationRate) / 100) / 12;

  const projection = [];
  let nominalValue = currentNetWorth;
  let realValue = currentNetWorth;
  let totalContributed = currentNetWorth;

  const currentYear = new Date().getFullYear();

  for (let year = 1; year <= yearsToProject; year++) {
    for (let m = 0; m < 12; m++) {
      nominalValue = (nominalValue + monthlyContribution) * (1 + nominalMonthlyRate);
      realValue = (realValue + monthlyContribution) * (1 + realMonthlyRate);
      totalContributed += monthlyContribution;
    }

    projection.push({
      year: currentYear + year,
      yearsFromNow: year,
      nominalValue: Math.round(nominalValue),
      realValue: Math.round(realValue),
      totalContributed: Math.round(totalContributed),
      compoundGains: Math.round(Math.max(0, nominalValue - totalContributed)),
    });
  }

  return projection;
}
