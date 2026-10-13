import React, { useState } from 'react';
import {
  Target,
  Plus,
  Calendar,
  DollarSign,
  CheckCircle2,
  Trash2,
  Sparkles,
  Shield,
  Home,
  Plane,
  TrendingUp,
  X,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { Goal } from '../types/finance';
import { formatCurrency } from '../utils/calculations';

export const GoalsTracker: React.FC = () => {
  const {
    goals,
    addGoal,
    updateGoal,
    deleteGoal,
    contributeToGoal,
    currencySymbol,
    openAIWithTab,
    triggerConfetti,
  } = useFinance();

  // Add Goal Modal State
  const [showAddGoalModal, setShowAddGoalModal] = useState<boolean>(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalCurrent, setGoalCurrent] = useState('');
  const [goalMonthly, setGoalMonthly] = useState('');
  const [goalDate, setGoalDate] = useState('');
  const [goalCategory, setGoalCategory] = useState<Goal['category']>('emergency');

  // Quick contribute custom modal/input state
  const [contributeGoalId, setContributeGoalId] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');

  const totalGoalTargets = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalGoalCurrent = goals.reduce((s, g) => s + g.currentAmount, 0);
  const overallProgress = totalGoalTargets > 0 ? Math.round((totalGoalCurrent / totalGoalTargets) * 100) : 0;

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(goalTarget);
    const current = parseFloat(goalCurrent) || 0;
    const monthly = parseFloat(goalMonthly) || 0;

    if (!goalTitle.trim() || isNaN(target) || target <= 0) return;

    addGoal({
      title: goalTitle.trim(),
      targetAmount: target,
      currentAmount: current,
      monthlyContribution: monthly,
      targetDate: goalDate || new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
      category: goalCategory,
      color: goalCategory === 'emergency' ? 'teal' : goalCategory === 'property' ? 'blue' : 'indigo',
      iconName: goalCategory,
    });

    setGoalTitle('');
    setGoalTarget('');
    setGoalCurrent('');
    setGoalMonthly('');
    setGoalDate('');
    setShowAddGoalModal(false);
  };

  const handleQuickContribute = (goalId: string, amt: number) => {
    const result = contributeToGoal(goalId, amt);
    if (result.reachedGoal) {
      triggerConfetti();
    }
  };

  const handleCustomContributeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contributeGoalId) return;
    const amt = parseFloat(customAmount);
    if (isNaN(amt) || amt <= 0) return;

    const result = contributeToGoal(contributeGoalId, amt);
    if (result.reachedGoal) {
      triggerConfetti();
    }
    setContributeGoalId(null);
    setCustomAmount('');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* 1. Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Financial Goals & Milestones</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Track multi-horizon savings goals with real-time velocity projections and celebratory milestones.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddGoalModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Goal</span>
            </button>
            <button
              onClick={() => openAIWithTab('chat')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors border border-emerald-300"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>Goal Feasibility</span>
            </button>
          </div>
        </div>

        {/* Global Progress Snapshot */}
        <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-xs text-slate-500 font-medium">Total Saved Across Goals</div>
            <div className="text-xl font-bold font-mono text-slate-900 mt-1">
              {formatCurrency(totalGoalCurrent, currencySymbol)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              of {formatCurrency(totalGoalTargets, currencySymbol)} cumulative target
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-xs text-slate-500 font-medium">Aggregate Goals Progress</div>
            <div className="text-xl font-bold font-mono text-emerald-700 mt-1">
              {overallProgress}%
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Across {goals.length} target{goals.length === 1 ? '' : 's'}
            </div>
          </div>

          <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100">
            <div className="text-xs text-emerald-800 font-medium">Monthly Auto-Pace</div>
            <div className="text-xl font-bold font-mono text-emerald-950 mt-1">
              {formatCurrency(goals.reduce((s, g) => s + g.monthlyContribution, 0), currencySymbol)}/mo
            </div>
            <div className="text-[11px] text-emerald-700 mt-0.5 font-medium">
              Scheduled savings allocation
            </div>
          </div>
        </div>
      </div>

      {/* 2. Goals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {goals.map((goal) => {
          const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
          const isComplete = goal.currentAmount >= goal.targetAmount;

          // Estimated months at current monthly contribution
          const monthsAtCurrentPace = goal.monthlyContribution > 0 ? Math.ceil(remaining / goal.monthlyContribution) : null;

          return (
            <div
              key={goal.id}
              className={`bg-white border rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all hover:border-slate-300 ${
                isComplete ? 'border-emerald-300 ring-1 ring-emerald-200 bg-emerald-50/20' : 'border-slate-200/80'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="text-xs font-semibold text-slate-400 capitalize">
                      {goal.category}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {goal.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="p-1 text-slate-300 hover:text-rose-600 rounded"
                    title="Delete Goal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Amount Progress Numbers */}
                <div className="my-3">
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-xl font-extrabold font-mono text-slate-900">
                      {formatCurrency(goal.currentAmount, currencySymbol)}
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      / {formatCurrency(goal.targetAmount, currencySymbol)}
                    </span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isComplete ? 'bg-emerald-600' : 'bg-slate-900'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                    <span className="font-semibold text-slate-800">{progress}% funded</span>
                    <span>
                      {isComplete ? (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Fully Funded!
                        </span>
                      ) : (
                        `${formatCurrency(remaining, currencySymbol)} remaining`
                      )}
                    </span>
                  </div>
                </div>

                {/* Timeline / Target Info */}
                <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-600 my-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-[11px] text-slate-500">
                      <Calendar className="w-3 h-3" /> Target Date:
                    </span>
                    <span className="font-medium text-slate-800 text-[11px]">
                      {new Date(goal.targetDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-[11px] text-slate-500">
                      <Clock className="w-3 h-3" /> Monthly Pace:
                    </span>
                    <span className="font-mono text-slate-800 text-[11px]">
                      {formatCurrency(goal.monthlyContribution, currencySymbol)}/mo
                    </span>
                  </div>

                  {monthsAtCurrentPace !== null && !isComplete && (
                    <div className="pt-1 border-t border-slate-200 text-[10px] text-slate-500">
                      Achievable in ~{monthsAtCurrentPace} months at current rate
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons: Quick Contribute */}
              <div className="pt-2 border-t border-slate-100">
                <div className="text-[11px] font-semibold text-slate-500 mb-2">
                  Boost Progress:
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    onClick={() => handleQuickContribute(goal.id, 50)}
                    className="py-1.5 text-xs font-mono font-medium bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-800 transition-colors"
                  >
                    +50
                  </button>
                  <button
                    onClick={() => handleQuickContribute(goal.id, 100)}
                    className="py-1.5 text-xs font-mono font-medium bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-800 transition-colors"
                  >
                    +100
                  </button>
                  <button
                    onClick={() => handleQuickContribute(goal.id, 250)}
                    className="py-1.5 text-xs font-mono font-medium bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-800 transition-colors"
                  >
                    +250
                  </button>
                  <button
                    onClick={() => setContributeGoalId(goal.id)}
                    className="py-1.5 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors"
                  >
                    Custom
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Contribution Modal */}
      {contributeGoalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Contribute to Goal</h3>
              <button
                onClick={() => setContributeGoalId(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCustomContributeSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Contribution Amount ({currencySymbol})
                </label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  placeholder="500"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  autoFocus
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setContributeGoalId(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
                >
                  Deposit to Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Goal Modal */}
      {showAddGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Create New Goal</h3>
              <button
                onClick={() => setShowAddGoalModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Goal Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dream House Down Payment, Wedding Fund"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Category Type
                </label>
                <select
                  value={goalCategory}
                  onChange={(e) => setGoalCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none bg-white"
                >
                  <option value="emergency">Emergency Cushion</option>
                  <option value="property">Home / Real Estate</option>
                  <option value="travel">Travel & Experience</option>
                  <option value="investment">Retirement / Portfolio</option>
                  <option value="vehicle">Car / Vehicle</option>
                  <option value="other">Personal Milestone</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Target Amount ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    placeholder="25000"
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Starting Amount ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="2000"
                    value={goalCurrent}
                    onChange={(e) => setGoalCurrent(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={goalDate}
                    onChange={(e) => setGoalDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Monthly Contribution ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="350"
                    value={goalMonthly}
                    onChange={(e) => setGoalMonthly(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddGoalModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
