import React, { useState } from 'react';
import {
  PieChart,
  Plus,
  Sliders,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Trash2,
  Edit2,
  Save,
  X,
  Sparkles,
  ArrowRight,
  Shield,
  Coffee,
  PiggyBank,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { CategoryBudget, CategoryType } from '../types/finance';
import { formatCurrency, formatPercent } from '../utils/calculations';

export const BudgetPlanner: React.FC = () => {
  const {
    profile,
    currencySymbol,
    budgetRule,
    setBudgetRule,
    categoryBudgets,
    addCategoryBudget,
    updateCategoryBudget,
    deleteCategoryBudget,
    budgetStats,
    openAIWithTab,
  } = useFinance();

  // State for category editing
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editLimitValue, setEditLimitValue] = useState<number>(0);

  // State for new category modal
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<CategoryType>('needs');
  const [newCatLimit, setNewCatLimit] = useState('');

  // Handle Preset Budget Split
  const handleSplitPreset = (needs: number, wants: number, savings: number) => {
    setBudgetRule({
      needsPercent: needs,
      wantsPercent: wants,
      savingsPercent: savings,
    });
  };

  const handleStartEdit = (cat: CategoryBudget) => {
    setEditingCatId(cat.id);
    setEditLimitValue(cat.budgetLimit);
  };

  const handleSaveEdit = (catId: string) => {
    updateCategoryBudget(catId, { budgetLimit: Math.max(0, editLimitValue) });
    setEditingCatId(null);
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const limit = parseFloat(newCatLimit);
    if (!newCatName.trim() || isNaN(limit) || limit < 0) return;

    addCategoryBudget({
      name: newCatName.trim(),
      type: newCatType,
      budgetLimit: limit,
      iconName: newCatType === 'needs' ? 'Shield' : newCatType === 'wants' ? 'Coffee' : 'PiggyBank',
      color: newCatType === 'needs' ? 'blue' : newCatType === 'wants' ? 'amber' : 'emerald',
    });

    setNewCatName('');
    setNewCatLimit('');
    setShowAddModal(false);
  };

  // Group categories
  const needsCategories = categoryBudgets.filter(c => c.type === 'needs');
  const wantsCategories = categoryBudgets.filter(c => c.type === 'wants');
  const savingsCategories = categoryBudgets.filter(c => c.type === 'savings' || c.type === 'debt');

  const renderCategoryGroup = (
    title: string,
    type: CategoryType,
    categories: CategoryBudget[],
    targetPercent: number,
    totalSpent: number,
    colorAccent: 'blue' | 'amber' | 'emerald'
  ) => {
    const targetDollars = profile.monthlyIncome * (targetPercent / 100);
    const totalBudgeted = categories.reduce((sum, c) => sum + c.budgetLimit, 0);
    const groupRatio = targetDollars > 0 ? (totalSpent / targetDollars) * 100 : 0;

    const accentBg =
      colorAccent === 'blue'
        ? 'bg-blue-50 border-blue-200 text-blue-900'
        : colorAccent === 'amber'
        ? 'bg-amber-50 border-amber-200 text-amber-900'
        : 'bg-emerald-50 border-emerald-200 text-emerald-900';

    const barColor =
      colorAccent === 'blue'
        ? 'bg-blue-600'
        : colorAccent === 'amber'
        ? 'bg-amber-500'
        : 'bg-emerald-600';

    return (
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-md ${barColor}`} />
              <h3 className="text-base font-bold text-slate-900">{title}</h3>
              <span className="text-xs text-slate-500 font-mono">({targetPercent}% Target)</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Target Envelope: {formatCurrency(targetDollars, currencySymbol)} · Budgeted: {formatCurrency(totalBudgeted, currencySymbol)}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold font-mono text-slate-900">
              {formatCurrency(totalSpent, currencySymbol)} spent
            </div>
            <div className={`text-xs font-semibold ${totalSpent > targetDollars ? 'text-rose-600' : 'text-slate-500'}`}>
              {Math.round(groupRatio)}% of target envelope
            </div>
          </div>
        </div>

        {/* Categories List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {categories.map((cat) => {
            const spent = budgetStats.spentByCategory[cat.name] || 0;
            const ratio = cat.budgetLimit > 0 ? (spent / cat.budgetLimit) * 100 : 0;
            const isOver = spent > cat.budgetLimit && cat.budgetLimit > 0;
            const remaining = cat.budgetLimit - spent;
            const isEditing = editingCatId === cat.id;

            return (
              <div
                key={cat.id}
                className="p-3.5 rounded-xl border border-slate-200/70 bg-slate-50/40 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-xs text-slate-900 flex items-center gap-1.5">
                    <span>{cat.name}</span>
                    {isOver && (
                      <span className="text-[10px] text-rose-600 font-medium bg-rose-50 px-1.5 py-0.5 rounded">
                        Over by {formatCurrency(Math.abs(remaining), currencySymbol)}
                      </span>
                    )}
                  </div>

                  {/* Actions / Edit limit */}
                  <div className="flex items-center gap-1.5">
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={editLimitValue}
                          onChange={(e) => setEditLimitValue(parseFloat(e.target.value) || 0)}
                          className="w-20 px-2 py-0.5 text-xs border border-slate-300 rounded font-mono bg-white"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveEdit(cat.id)}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                          title="Save"
                        >
                          <Save className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingCatId(null)}
                          className="p-1 text-slate-400 hover:bg-slate-200 rounded"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-mono text-slate-500">
                          Limit: {formatCurrency(cat.budgetLimit, currencySymbol)}
                        </span>
                        <button
                          onClick={() => handleStartEdit(cat)}
                          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded transition-colors"
                          title="Edit Limit"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => deleteCategoryBudget(cat.id)}
                          className="p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isOver ? 'bg-rose-500' : ratio > 80 ? 'bg-amber-500' : barColor
                    }`}
                    style={{ width: `${Math.min(100, ratio)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Spent: <strong className="font-mono text-slate-800">{formatCurrency(spent, currencySymbol)}</strong></span>
                  <span>
                    {remaining >= 0 ? (
                      <span className="text-emerald-700 font-medium">
                        {formatCurrency(remaining, currencySymbol)} left
                      </span>
                    ) : (
                      <span className="text-rose-600 font-medium">
                        -{formatCurrency(Math.abs(remaining), currencySymbol)}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* 1. Header & Split Presets Controls */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">50 / 30 / 20 Budget Architect</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Based on monthly net income of <strong className="font-mono text-slate-900">{formatCurrency(profile.monthlyIncome, currencySymbol)}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Category</span>
            </button>
            <button
              onClick={() => openAIWithTab('audit')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors border border-emerald-300"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>AI Budget Audit</span>
            </button>
          </div>
        </div>

        {/* Allocation Strategy Presets */}
        <div className="pt-4">
          <div className="text-xs font-semibold text-slate-700 mb-2">Rule Preset Strategy</div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <button
              onClick={() => handleSplitPreset(50, 30, 20)}
              className={`p-3 rounded-xl border text-left transition-all ${
                budgetRule.needsPercent === 50 && budgetRule.wantsPercent === 30 && budgetRule.savingsPercent === 20
                  ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
              }`}
            >
              <div className="text-xs font-bold">Standard 50/30/20</div>
              <div className={`text-[11px] mt-0.5 ${budgetRule.needsPercent === 50 && budgetRule.wantsPercent === 30 ? 'text-slate-300' : 'text-slate-500'}`}>
                Balanced baseline
              </div>
            </button>

            <button
              onClick={() => handleSplitPreset(40, 20, 40)}
              className={`p-3 rounded-xl border text-left transition-all ${
                budgetRule.needsPercent === 40 && budgetRule.wantsPercent === 20 && budgetRule.savingsPercent === 40
                  ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
              }`}
            >
              <div className="text-xs font-bold">FIRE / Aggressive 40/20/40</div>
              <div className={`text-[11px] mt-0.5 ${budgetRule.savingsPercent === 40 ? 'text-slate-300' : 'text-slate-500'}`}>
                Fast-track early wealth
              </div>
            </button>

            <button
              onClick={() => handleSplitPreset(60, 20, 20)}
              className={`p-3 rounded-xl border text-left transition-all ${
                budgetRule.needsPercent === 60 && budgetRule.wantsPercent === 20 && budgetRule.savingsPercent === 20
                  ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
              }`}
            >
              <div className="text-xs font-bold">Metro / HCOL 60/20/20</div>
              <div className={`text-[11px] mt-0.5 ${budgetRule.needsPercent === 60 ? 'text-slate-300' : 'text-slate-500'}`}>
                Higher housing overhead
              </div>
            </button>

            <button
              onClick={() => handleSplitPreset(55, 15, 30)}
              className={`p-3 rounded-xl border text-left transition-all ${
                budgetRule.needsPercent === 55 && budgetRule.wantsPercent === 15 && budgetRule.savingsPercent === 30
                  ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
              }`}
            >
              <div className="text-xs font-bold">Debt Payoff 55/15/30</div>
              <div className={`text-[11px] mt-0.5 ${budgetRule.savingsPercent === 30 ? 'text-slate-300' : 'text-slate-500'}`}>
                Crush high APR loans
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Needs Categories */}
      {renderCategoryGroup(
        'Fixed & Essential Needs',
        'needs',
        needsCategories,
        budgetRule.needsPercent,
        budgetStats.totalNeedsSpent,
        'blue'
      )}

      {/* 3. Wants Categories */}
      {renderCategoryGroup(
        'Discretionary Wants & Lifestyle',
        'wants',
        wantsCategories,
        budgetRule.wantsPercent,
        budgetStats.totalWantsSpent,
        'amber'
      )}

      {/* 4. Savings & Debt Paydown */}
      {renderCategoryGroup(
        'Savings, Investments & Debt Payoff',
        'savings',
        savingsCategories,
        budgetRule.savingsPercent,
        budgetStats.totalSavingsSpent + budgetStats.totalDebtSpent,
        'emerald'
      )}

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add Budget Category</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Gym & Fitness, Pet Care"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Pillar Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewCatType('needs')}
                    className={`py-2 px-2 text-xs rounded-lg font-medium border text-center ${
                      newCatType === 'needs' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    Needs
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewCatType('wants')}
                    className={`py-2 px-2 text-xs rounded-lg font-medium border text-center ${
                      newCatType === 'wants' ? 'bg-amber-500 text-white border-amber-500' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    Wants
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewCatType('savings')}
                    className={`py-2 px-2 text-xs rounded-lg font-medium border text-center ${
                      newCatType === 'savings' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    Savings
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Monthly Budget Limit ({currencySymbol})
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="200"
                  value={newCatLimit}
                  onChange={(e) => setNewCatLimit(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
                >
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
