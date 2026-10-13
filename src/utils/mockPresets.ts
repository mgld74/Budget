import { UserProfile, CategoryBudget, Goal, DebtItem, Transaction, BudgetRule } from '../types/finance';

export interface PresetProfile {
  id: string;
  name: string;
  tagline: string;
  profile: UserProfile;
  budgetRule: BudgetRule;
  categoryBudgets: CategoryBudget[];
  debts: DebtItem[];
  goals: Goal[];
  transactions: Transaction[];
}

export const PRESET_PROFILES: PresetProfile[] = [
  {
    id: 'balanced_pro',
    name: 'Balanced Professional',
    tagline: 'Moderate income, steady savings & high-yield investments',
    profile: {
      name: 'Alex Morgan',
      monthlyIncome: 6200,
      liquidSavings: 18500,
      investments: 42000,
      currency: 'USD',
      currencySymbol: '$',
    },
    budgetRule: {
      needsPercent: 50,
      wantsPercent: 30,
      savingsPercent: 20,
    },
    categoryBudgets: [
      { id: 'b1', name: 'Housing & Rent', type: 'needs', budgetLimit: 1750, iconName: 'Home', color: 'blue' },
      { id: 'b2', name: 'Groceries & Essentials', type: 'needs', budgetLimit: 600, iconName: 'ShoppingCart', color: 'emerald' },
      { id: 'b3', name: 'Utilities & Internet', type: 'needs', budgetLimit: 280, iconName: 'Zap', color: 'cyan' },
      { id: 'b4', name: 'Healthcare & Insurance', type: 'needs', budgetLimit: 220, iconName: 'HeartPulse', color: 'rose' },
      { id: 'b5', name: 'Transit & Gas', type: 'needs', budgetLimit: 250, iconName: 'Car', color: 'amber' },
      { id: 'b6', name: 'Dining Out & Cafes', type: 'wants', budgetLimit: 450, iconName: 'Utensils', color: 'orange' },
      { id: 'b7', name: 'Entertainment & Subscriptions', type: 'wants', budgetLimit: 220, iconName: 'Tv', color: 'purple' },
      { id: 'b8', name: 'Shopping & Gear', type: 'wants', budgetLimit: 350, iconName: 'ShoppingBag', color: 'pink' },
      { id: 'b9', name: 'Travel & Vacations', type: 'wants', budgetLimit: 300, iconName: 'Compass', color: 'indigo' },
      { id: 'b10', name: 'Index Funds & 401(k)', type: 'savings', budgetLimit: 850, iconName: 'TrendingUp', color: 'emerald' },
      { id: 'b11', name: 'Emergency Fund Boost', type: 'savings', budgetLimit: 400, iconName: 'ShieldCheck', color: 'teal' },
      { id: 'b12', name: 'Student Loan Paydown', type: 'debt', budgetLimit: 350, iconName: 'GraduationCap', color: 'red' },
    ],
    debts: [
      { id: 'd1', name: 'Undergraduate Federal Loan', balance: 14200, interestRate: 4.8, minimumPayment: 180, category: 'student_loan' },
      { id: 'd2', name: 'Automobile Loan', balance: 9600, interestRate: 6.2, minimumPayment: 260, category: 'car_loan' },
      { id: 'd3', name: 'Sapphire Preferred Card', balance: 1850, interestRate: 21.49, minimumPayment: 75, category: 'credit_card' },
    ],
    goals: [
      { id: 'g1', title: '6-Month Emergency Cushion', targetAmount: 22000, currentAmount: 18500, targetDate: '2027-04-01', monthlyContribution: 400, category: 'emergency', color: 'emerald', iconName: 'Shield' },
      { id: 'g2', title: 'Home Down Payment (20%)', targetAmount: 65000, currentAmount: 28000, targetDate: '2028-12-01', monthlyContribution: 650, category: 'property', color: 'blue', iconName: 'Home' },
      { id: 'g3', title: 'Japan Autumn Expedition', targetAmount: 4500, currentAmount: 3200, targetDate: '2027-10-15', monthlyContribution: 250, category: 'travel', color: 'indigo', iconName: 'Plane' },
    ],
    transactions: [
      { id: 't1', date: '2026-10-01', description: 'Monthly Tech Salary Deposit', amount: 6200, type: 'income', category: 'Salary' },
      { id: 't2', date: '2026-10-02', description: 'Apartment Monthly Rent', amount: 1750, type: 'needs', category: 'Housing & Rent' },
      { id: 't3', date: '2026-10-03', description: 'Whole Foods Market', amount: 142, type: 'needs', category: 'Groceries & Essentials' },
      { id: 't4', date: '2026-10-04', description: 'Electric & High-Speed Fiber', amount: 165, type: 'needs', category: 'Utilities & Internet' },
      { id: 't5', date: '2026-10-05', description: 'Weekend Sushi Bistro', amount: 88, type: 'wants', category: 'Dining Out & Cafes' },
      { id: 't6', date: '2026-10-06', description: 'Spotify & Streaming Bundles', amount: 34, type: 'wants', category: 'Entertainment & Subscriptions' },
      { id: 't7', date: '2026-10-07', description: 'S&P 500 Index Auto-Transfer', amount: 450, type: 'savings', category: 'Index Funds & 401(k)' },
      { id: 't8', date: '2026-10-08', description: 'Auto Loan Monthly Payment', amount: 260, type: 'debt', category: 'Transit & Gas' },
      { id: 't9', date: '2026-10-09', description: 'Trader Joe’s Essentials', amount: 96, type: 'needs', category: 'Groceries & Essentials' },
      { id: 't10', date: '2026-10-10', description: 'Coffee Roasters', amount: 24, type: 'wants', category: 'Dining Out & Cafes' },
      { id: 't11', date: '2026-10-11', description: 'Sapphire Credit Card Extra Paydown', amount: 300, type: 'debt', category: 'Student Loan Paydown' },
      { id: 't12', date: '2026-10-12', description: 'High Yield Savings Deposit', amount: 200, type: 'savings', category: 'Emergency Fund Boost' },
    ],
  },
  {
    id: 'debt_crusher',
    name: 'Debt Crusher',
    tagline: 'High interest load actively attacking debt with Avalanche method',
    profile: {
      name: 'Taylor Reed',
      monthlyIncome: 4800,
      liquidSavings: 3200,
      investments: 6500,
      currency: 'USD',
      currencySymbol: '$',
    },
    budgetRule: {
      needsPercent: 55,
      wantsPercent: 15,
      savingsPercent: 30,
    },
    categoryBudgets: [
      { id: 'b1', name: 'Housing & Rent', type: 'needs', budgetLimit: 1400, iconName: 'Home', color: 'blue' },
      { id: 'b2', name: 'Groceries & Meal Prep', type: 'needs', budgetLimit: 450, iconName: 'ShoppingCart', color: 'emerald' },
      { id: 'b3', name: 'Utilities & Phone', type: 'needs', budgetLimit: 220, iconName: 'Zap', color: 'cyan' },
      { id: 'b4', name: 'Car Payment & Gas', type: 'needs', budgetLimit: 400, iconName: 'Car', color: 'amber' },
      { id: 'b5', name: 'Modest Dining & Takeout', type: 'wants', budgetLimit: 200, iconName: 'Utensils', color: 'orange' },
      { id: 'b6', name: 'Basic Streaming', type: 'wants', budgetLimit: 50, iconName: 'Tv', color: 'purple' },
      { id: 'b7', name: 'Emergency Seed Reserve', type: 'savings', budgetLimit: 150, iconName: 'ShieldCheck', color: 'teal' },
      { id: 'b8', name: 'Debt Avalanche Strike Fund', type: 'debt', budgetLimit: 1200, iconName: 'Flame', color: 'red' },
    ],
    debts: [
      { id: 'd1', name: 'Store Credit Card (Retail)', balance: 2800, interestRate: 27.99, minimumPayment: 110, category: 'credit_card' },
      { id: 'd2', name: 'Chase Freedom Card', balance: 6400, interestRate: 22.24, minimumPayment: 210, category: 'credit_card' },
      { id: 'd3', name: 'Personal Consolidation Loan', balance: 11500, interestRate: 11.5, minimumPayment: 320, category: 'personal_loan' },
      { id: 'd4', name: 'Car Loan', balance: 7200, interestRate: 7.9, minimumPayment: 210, category: 'car_loan' },
    ],
    goals: [
      { id: 'g1', title: 'Starter $5,000 Safety Net', targetAmount: 5000, currentAmount: 3200, targetDate: '2027-01-01', monthlyContribution: 150, category: 'emergency', color: 'emerald', iconName: 'Shield' },
      { id: 'g2', title: 'Total Consumer Debt Freedom', targetAmount: 27900, currentAmount: 8200, targetDate: '2028-06-01', monthlyContribution: 950, category: 'other', color: 'red', iconName: 'Zap' },
    ],
    transactions: [
      { id: 't1', date: '2026-10-01', description: 'Primary Bi-Weekly Paycheck', amount: 2400, type: 'income', category: 'Salary' },
      { id: 't2', date: '2026-10-02', description: 'Rent Payment', amount: 1400, type: 'needs', category: 'Housing & Rent' },
      { id: 't3', date: '2026-10-03', description: 'ALDI Groceries Bulk', amount: 125, type: 'needs', category: 'Groceries & Meal Prep' },
      { id: 't4', date: '2026-10-04', description: 'Store Card Avalanche Payment', amount: 650, type: 'debt', category: 'Debt Avalanche Strike Fund' },
      { id: 't5', date: '2026-10-06', description: 'Gas Station Fuel', amount: 55, type: 'needs', category: 'Car Payment & Gas' },
      { id: 't6', date: '2026-10-08', description: 'Chase Freedom Minimum', amount: 210, type: 'debt', category: 'Debt Avalanche Strike Fund' },
      { id: 't7', date: '2026-10-10', description: 'Groceries Top-up', amount: 60, type: 'needs', category: 'Groceries & Meal Prep' },
      { id: 't8', date: '2026-10-12', description: 'Emergency Savings Transfer', amount: 75, type: 'savings', category: 'Emergency Seed Reserve' },
    ],
  },
  {
    id: 'family_growth',
    name: 'Family Growth & Security',
    tagline: 'Dual income, mortgage, childcare & college nest-egg builder',
    profile: {
      name: 'The Martinez Family',
      monthlyIncome: 9400,
      liquidSavings: 34000,
      investments: 98000,
      currency: 'USD',
      currencySymbol: '$',
    },
    budgetRule: {
      needsPercent: 55,
      wantsPercent: 20,
      savingsPercent: 25,
    },
    categoryBudgets: [
      { id: 'b1', name: 'Mortgage & Escrow', type: 'needs', budgetLimit: 2850, iconName: 'Home', color: 'blue' },
      { id: 'b2', name: 'Childcare & Daycare', type: 'needs', budgetLimit: 1400, iconName: 'Users', color: 'teal' },
      { id: 'b3', name: 'Family Groceries', type: 'needs', budgetLimit: 950, iconName: 'ShoppingCart', color: 'emerald' },
      { id: 'b4', name: 'Utilities & Home Services', type: 'needs', budgetLimit: 380, iconName: 'Zap', color: 'cyan' },
      { id: 'b5', name: 'Family Activities & Dining', type: 'wants', budgetLimit: 600, iconName: 'Utensils', color: 'orange' },
      { id: 'b6', name: 'Kids Sports & Lessons', type: 'wants', budgetLimit: 350, iconName: 'Activity', color: 'purple' },
      { id: 'b7', name: 'Vacation Sinking Fund', type: 'wants', budgetLimit: 400, iconName: 'Compass', color: 'indigo' },
      { id: 'b8', name: '529 College Savings', type: 'savings', budgetLimit: 600, iconName: 'GraduationCap', color: 'emerald' },
      { id: 'b9', name: 'Retirement (IRA/401k)', type: 'savings', budgetLimit: 1200, iconName: 'TrendingUp', color: 'blue' },
      { id: 'b10', name: 'Auto Loan (Minivan)', type: 'debt', budgetLimit: 380, iconName: 'Car', color: 'amber' },
    ],
    debts: [
      { id: 'd1', name: 'Home Mortgage (30yr Fixed)', balance: 345000, interestRate: 3.75, minimumPayment: 2150, category: 'mortgage' },
      { id: 'd2', name: 'Family SUV Loan', balance: 13800, interestRate: 4.9, minimumPayment: 380, category: 'car_loan' },
    ],
    goals: [
      { id: 'g1', title: '6-Month Family Emergency Vault', targetAmount: 35000, currentAmount: 34000, targetDate: '2026-12-01', monthlyContribution: 500, category: 'emergency', color: 'emerald', iconName: 'Shield' },
      { id: 'g2', title: 'Kids 529 College Fund', targetAmount: 75000, currentAmount: 32000, targetDate: '2033-08-01', monthlyContribution: 600, category: 'investment', color: 'blue', iconName: 'GraduationCap' },
      { id: 'g3', title: 'Summer National Parks Trip', targetAmount: 3500, currentAmount: 2100, targetDate: '2027-07-01', monthlyContribution: 300, category: 'travel', color: 'indigo', iconName: 'Compass' },
    ],
    transactions: [
      { id: 't1', date: '2026-10-01', description: 'Combined Monthly Salary', amount: 9400, type: 'income', category: 'Salary' },
      { id: 't2', date: '2026-10-02', description: 'Mortgage Auto-Draft', amount: 2850, type: 'needs', category: 'Mortgage & Escrow' },
      { id: 't3', date: '2026-10-03', description: 'Montessori Daycare Monthly', amount: 1400, type: 'needs', category: 'Childcare & Daycare' },
      { id: 't4', date: '2026-10-04', description: 'Costco Wholesale Family Run', amount: 385, type: 'needs', category: 'Family Groceries' },
      { id: 't5', date: '2026-10-05', description: 'Vanguard 529 Contribution', amount: 600, type: 'savings', category: '529 College Savings' },
      { id: 't6', date: '2026-10-06', description: 'Fidelity Index Fund Deposit', amount: 1200, type: 'savings', category: 'Retirement (IRA/401k)' },
      { id: 't7', date: '2026-10-07', description: 'Family Pizza & Bowling Night', amount: 110, type: 'wants', category: 'Family Activities & Dining' },
      { id: 't8', date: '2026-10-08', description: 'SUV Loan Payment', amount: 380, type: 'debt', category: 'Auto Loan (Minivan)' },
    ],
  },
];
