export type CategoryType = 'needs' | 'wants' | 'savings' | 'debt';

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  amount: number; // positive number
  type: 'income' | CategoryType;
  category: string;
  isRecurring?: boolean;
}

export interface CategoryBudget {
  id: string;
  name: string;
  type: CategoryType;
  budgetLimit: number;
  iconName: string;
  color: string;
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  monthlyContribution: number;
  category: 'emergency' | 'property' | 'travel' | 'investment' | 'vehicle' | 'other';
  color: string;
  iconName: string;
}

export interface DebtItem {
  id: string;
  name: string;
  balance: number;
  interestRate: number; // percentage, e.g. 18.5 for 18.5%
  minimumPayment: number;
  category: 'credit_card' | 'student_loan' | 'car_loan' | 'mortgage' | 'personal_loan';
}

export interface BudgetRule {
  needsPercent: number;
  wantsPercent: number;
  savingsPercent: number;
}

export interface UserProfile {
  name: string;
  monthlyIncome: number;
  liquidSavings: number;
  investments: number;
  currency: string;
  currencySymbol: string;
}

export interface PayoffStrategyResult {
  strategy: 'avalanche' | 'snowball';
  totalMonths: number;
  totalInterestPaid: number;
  payoffDate: string;
  monthlySchedule: {
    month: number;
    yearMonth: string;
    remainingBalance: number;
    interestPaid: number;
    principalPaid: number;
  }[];
}

export interface FinancialHealthBreakdown {
  score: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  savingsRateScore: number;
  emergencyRunwayScore: number;
  needsWantsRatioScore: number;
  debtBurdenScore: number;
  runwayMonths: number;
  savingsRate: number;
  monthlySurplus: number;
  totalNetWorth: number;
}

export interface AIAuditResult {
  financialHealthVerdict: string;
  healthScore: number;
  keyObservations: {
    type: 'positive' | 'warning' | 'neutral';
    title: string;
    detail: string;
  }[];
  prioritizedActions: {
    priority: 'High' | 'Medium' | 'Low';
    action: string;
    impact: string;
    effort: 'Quick Win' | 'Strategic';
  }[];
  budgetRuleFeedback: string;
  recommendedMonthlySavingsTarget: number;
}
