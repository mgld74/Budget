import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  UserProfile,
  CategoryBudget,
  Goal,
  DebtItem,
  Transaction,
  BudgetRule,
  FinancialHealthBreakdown,
} from '../types/finance';
import { PRESET_PROFILES, PresetProfile } from '../utils/mockPresets';
import { calculateBudgetStats, calculateHealthScore } from '../utils/calculations';

interface FinanceContextType {
  profile: UserProfile;
  setProfile: (update: Partial<UserProfile>) => void;
  budgetRule: BudgetRule;
  setBudgetRule: (rule: BudgetRule) => void;
  categoryBudgets: CategoryBudget[];
  addCategoryBudget: (cat: Omit<CategoryBudget, 'id'>) => void;
  updateCategoryBudget: (id: string, cat: Partial<CategoryBudget>) => void;
  deleteCategoryBudget: (id: string) => void;
  debts: DebtItem[];
  addDebt: (debt: Omit<DebtItem, 'id'>) => void;
  updateDebt: (id: string, debt: Partial<DebtItem>) => void;
  deleteDebt: (id: string) => void;
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  updateGoal: (id: string, goal: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  contributeToGoal: (goalId: string, amount: number) => { reachedGoal: boolean };
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  activeTab: 'dashboard' | 'budget' | 'debts' | 'goals' | 'simulator' | 'transactions';
  setActiveTab: (tab: 'dashboard' | 'budget' | 'debts' | 'goals' | 'simulator' | 'transactions') => void;
  currencySymbol: string;
  setCurrency: (symbol: string, code: string) => void;
  loadPreset: (presetId: string) => void;
  resetToDefault: () => void;
  exportJSON: () => void;
  importJSON: (jsonString: string) => boolean;
  isAIOpen: boolean;
  setIsAIOpen: (open: boolean) => void;
  aiInitialTab: 'audit' | 'stress' | 'chat';
  openAIWithTab: (tab: 'audit' | 'stress' | 'chat') => void;
  healthBreakdown: FinancialHealthBreakdown;
  budgetStats: ReturnType<typeof calculateBudgetStats>;
  triggerConfetti: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEY = 'smart_money_planner_data_v1';

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const defaultPreset = PRESET_PROFILES[0];

  const [profile, setProfileState] = useState<UserProfile>(defaultPreset.profile);
  const [budgetRule, setBudgetRule] = useState<BudgetRule>(defaultPreset.budgetRule);
  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudget[]>(defaultPreset.categoryBudgets);
  const [debts, setDebts] = useState<DebtItem[]>(defaultPreset.debts);
  const [goals, setGoals] = useState<Goal[]>(defaultPreset.goals);
  const [transactions, setTransactions] = useState<Transaction[]>(defaultPreset.transactions);
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'budget' | 'debts' | 'goals' | 'simulator' | 'transactions'>('dashboard');
  const [isAIOpen, setIsAIOpen] = useState<boolean>(false);
  const [aiInitialTab, setAiInitialTab] = useState<'audit' | 'stress' | 'chat'>('audit');

  // Load from localStorage on initial render
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.profile) setProfileState(parsed.profile);
        if (parsed.budgetRule) setBudgetRule(parsed.budgetRule);
        if (parsed.categoryBudgets) setCategoryBudgets(parsed.categoryBudgets);
        if (parsed.debts) setDebts(parsed.debts);
        if (parsed.goals) setGoals(parsed.goals);
        if (parsed.transactions) setTransactions(parsed.transactions);
      }
    } catch (e) {
      console.warn('Failed to parse saved financial data from localStorage', e);
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    try {
      const dataToSave = {
        profile,
        budgetRule,
        categoryBudgets,
        debts,
        goals,
        transactions,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.warn('Could not persist to localStorage', e);
    }
  }, [profile, budgetRule, categoryBudgets, debts, goals, transactions]);

  const setProfile = (update: Partial<UserProfile>) => {
    setProfileState(prev => ({ ...prev, ...update }));
  };

  const setCurrency = (symbol: string, code: string) => {
    setProfileState(prev => ({ ...prev, currency: code, currencySymbol: symbol }));
  };

  const addCategoryBudget = (cat: Omit<CategoryBudget, 'id'>) => {
    const newCat: CategoryBudget = { ...cat, id: 'cat_' + Date.now() };
    setCategoryBudgets(prev => [...prev, newCat]);
  };

  const updateCategoryBudget = (id: string, update: Partial<CategoryBudget>) => {
    setCategoryBudgets(prev => prev.map(c => (c.id === id ? { ...c, ...update } : c)));
  };

  const deleteCategoryBudget = (id: string) => {
    setCategoryBudgets(prev => prev.filter(c => c.id !== id));
  };

  const addDebt = (debt: Omit<DebtItem, 'id'>) => {
    const newDebt: DebtItem = { ...debt, id: 'debt_' + Date.now() };
    setDebts(prev => [...prev, newDebt]);
  };

  const updateDebt = (id: string, update: Partial<DebtItem>) => {
    setDebts(prev => prev.map(d => (d.id === id ? { ...d, ...update } : d)));
  };

  const deleteDebt = (id: string) => {
    setDebts(prev => prev.filter(d => d.id !== id));
  };

  const addGoal = (goal: Omit<Goal, 'id'>) => {
    const newGoal: Goal = { ...goal, id: 'goal_' + Date.now() };
    setGoals(prev => [...prev, newGoal]);
  };

  const updateGoal = (id: string, update: Partial<Goal>) => {
    setGoals(prev => prev.map(g => (g.id === id ? { ...g, ...update } : g)));
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // safe fallback
    }
  };

  const contributeToGoal = (goalId: string, amount: number) => {
    let reached = false;
    setGoals(prev =>
      prev.map(g => {
        if (g.id === goalId) {
          const newCurrent = g.currentAmount + amount;
          if (newCurrent >= g.targetAmount && g.currentAmount < g.targetAmount) {
            reached = true;
          }
          return { ...g, currentAmount: newCurrent };
        }
        return g;
      })
    );

    // Also deduct from liquid savings or log transaction
    addTransaction({
      date: new Date().toISOString().split('T')[0],
      description: `Contribution to ${goals.find(g => g.id === goalId)?.title || 'Goal'}`,
      amount,
      type: 'savings',
      category: 'Goal Contribution',
    });

    if (reached) {
      triggerConfetti();
    }

    return { reachedGoal: reached };
  };

  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = { ...tx, id: 'tx_' + Date.now() + Math.random().toString(36).substring(2, 5) };
    setTransactions(prev => [newTx, ...prev]);

    // If transaction affects debt minimum, or increases savings
    if (tx.type === 'debt') {
      // Find matching debt if name matches
      const matched = debts.find(d => tx.description.toLowerCase().includes(d.name.toLowerCase()));
      if (matched) {
        updateDebt(matched.id, { balance: Math.max(0, matched.balance - tx.amount) });
      }
    }
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const loadPreset = (presetId: string) => {
    const found = PRESET_PROFILES.find(p => p.id === presetId);
    if (found) {
      setProfileState(found.profile);
      setBudgetRule(found.budgetRule);
      setCategoryBudgets(found.categoryBudgets);
      setDebts(found.debts);
      setGoals(found.goals);
      setTransactions(found.transactions);
    }
  };

  const resetToDefault = () => {
    loadPreset('balanced_pro');
  };

  const exportJSON = () => {
    const data = {
      profile,
      budgetRule,
      categoryBudgets,
      debts,
      goals,
      transactions,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `smart-money-planner-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.profile && parsed.categoryBudgets) {
        if (parsed.profile) setProfileState(parsed.profile);
        if (parsed.budgetRule) setBudgetRule(parsed.budgetRule);
        if (parsed.categoryBudgets) setCategoryBudgets(parsed.categoryBudgets);
        if (parsed.debts) setDebts(parsed.debts);
        if (parsed.goals) setGoals(parsed.goals);
        if (parsed.transactions) setTransactions(parsed.transactions);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const openAIWithTab = (tab: 'audit' | 'stress' | 'chat') => {
    setAiInitialTab(tab);
    setIsAIOpen(true);
  };

  // Derived budget statistics
  const budgetStats = useMemo(() => {
    return calculateBudgetStats(profile.monthlyIncome, categoryBudgets, transactions);
  }, [profile.monthlyIncome, categoryBudgets, transactions]);

  // Derived health breakdown
  const totalDebtBalance = useMemo(() => {
    return debts.reduce((sum, d) => sum + d.balance, 0);
  }, [debts]);

  const healthBreakdown = useMemo(() => {
    return calculateHealthScore(
      profile.monthlyIncome,
      budgetStats.totalNeedsSpent || budgetStats.budgetedNeeds,
      budgetStats.totalWantsSpent || budgetStats.budgetedWants,
      profile.liquidSavings,
      totalDebtBalance,
      profile.investments
    );
  }, [profile, budgetStats, totalDebtBalance]);

  return (
    <FinanceContext.Provider
      value={{
        profile,
        setProfile,
        budgetRule,
        setBudgetRule,
        categoryBudgets,
        addCategoryBudget,
        updateCategoryBudget,
        deleteCategoryBudget,
        debts,
        addDebt,
        updateDebt,
        deleteDebt,
        goals,
        addGoal,
        updateGoal,
        deleteGoal,
        contributeToGoal,
        transactions,
        addTransaction,
        deleteTransaction,
        activeTab,
        setActiveTab,
        currencySymbol: profile.currencySymbol || '$',
        setCurrency,
        loadPreset,
        resetToDefault,
        exportJSON,
        importJSON,
        isAIOpen,
        setIsAIOpen,
        aiInitialTab,
        openAIWithTab,
        healthBreakdown,
        budgetStats,
        triggerConfetti,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
