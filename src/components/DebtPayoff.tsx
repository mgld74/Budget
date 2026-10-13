import React, { useState, useMemo } from 'react';
import {
  TrendingDown,
  Flame,
  Snowflake,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  X,
  Sparkles,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { DebtItem } from '../types/finance';
import { calculateDebtPayoff, formatCurrency } from '../utils/calculations';

export const DebtPayoff: React.FC = () => {
  const {
    debts,
    addDebt,
    updateDebt,
    deleteDebt,
    currencySymbol,
    openAIWithTab,
    triggerConfetti,
  } = useFinance();

  // Extra payment booster state
  const [extraPayment, setExtraPayment] = useState<number>(150);
  const [selectedStrategy, setSelectedStrategy] = useState<'avalanche' | 'snowball'>('avalanche');

  // Add Debt Modal
  const [showAddDebtModal, setShowAddDebtModal] = useState<boolean>(false);
  const [debtName, setDebtName] = useState('');
  const [debtBalance, setDebtBalance] = useState('');
  const [debtRate, setDebtRate] = useState('');
  const [debtMin, setDebtMin] = useState('');
  const [debtCat, setDebtCat] = useState<DebtItem['category']>('credit_card');

  // Compute payoffs
  const avalancheResult = useMemo(() => {
    return calculateDebtPayoff(debts, extraPayment, 'avalanche');
  }, [debts, extraPayment]);

  const snowballResult = useMemo(() => {
    return calculateDebtPayoff(debts, extraPayment, 'snowball');
  }, [debts, extraPayment]);

  // Baseline payoff with $0 extra
  const baselineAvalanche = useMemo(() => {
    return calculateDebtPayoff(debts, 0, 'avalanche');
  }, [debts]);

  const interestSavedWithBooster = Math.max(0, baselineAvalanche.totalInterestPaid - avalancheResult.totalInterestPaid);
  const monthsAccelerated = Math.max(0, baselineAvalanche.totalMonths - avalancheResult.totalMonths);

  const activeResult = selectedStrategy === 'avalanche' ? avalancheResult : snowballResult;
  const totalBalance = debts.reduce((sum, d) => sum + d.balance, 0);
  const totalMinPayment = debts.reduce((sum, d) => sum + d.minimumPayment, 0);

  const handleCreateDebt = (e: React.FormEvent) => {
    e.preventDefault();
    const balance = parseFloat(debtBalance);
    const rate = parseFloat(debtRate);
    const min = parseFloat(debtMin);

    if (!debtName.trim() || isNaN(balance) || isNaN(rate) || isNaN(min)) return;

    addDebt({
      name: debtName.trim(),
      balance,
      interestRate: rate,
      minimumPayment: min,
      category: debtCat,
    });

    setDebtName('');
    setDebtBalance('');
    setDebtRate('');
    setDebtMin('');
    setShowAddDebtModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* 1. Overview Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">Debt Payoff War Room</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                Avalanche vs Snowball
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Compare mathematical interest savings against behavioral milestone momentum.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddDebtModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Debt</span>
            </button>
            <button
              onClick={() => openAIWithTab('chat')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors border border-emerald-300"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>Ask Debt Advisor</span>
            </button>
          </div>
        </div>

        {/* Total Debts KPI */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-xs text-slate-500 font-medium">Total Principal Debt</div>
            <div className="text-xl font-bold font-mono text-slate-900 mt-1">
              {formatCurrency(totalBalance, currencySymbol)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Across {debts.length} active account{debts.length === 1 ? '' : 's'}
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-xs text-slate-500 font-medium">Monthly Minimum Requirement</div>
            <div className="text-xl font-bold font-mono text-slate-900 mt-1">
              {formatCurrency(totalMinPayment, currencySymbol)}/mo
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Non-negotiable cash outflow
            </div>
          </div>

          <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-100">
            <div className="text-xs text-emerald-800 font-medium">Interest Saved by Booster</div>
            <div className="text-xl font-bold font-mono text-emerald-950 mt-1">
              {formatCurrency(interestSavedWithBooster, currencySymbol)}
            </div>
            <div className="text-[11px] text-emerald-700 mt-0.5 font-medium">
              Debt-free {monthsAccelerated} months sooner
            </div>
          </div>
        </div>

        {/* Extra Monthly Payment Booster Slider */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div>
              <span className="text-xs font-bold text-slate-900">
                Extra Monthly Payment Acceleration:
              </span>
              <span className="text-xs font-mono font-bold text-emerald-700 ml-1.5">
                +{formatCurrency(extraPayment, currencySymbol)}/month
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {[0, 75, 150, 300, 500].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setExtraPayment(amt)}
                  className={`px-2 py-1 text-xs font-mono rounded-md border transition-colors ${
                    extraPayment === amt
                      ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  +{formatCurrency(amt, currencySymbol)}
                </button>
              ))}
            </div>
          </div>

          <input
            type="range"
            min="0"
            max="1500"
            step="25"
            value={extraPayment}
            onChange={(e) => setExtraPayment(parseFloat(e.target.value) || 0)}
            className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* 2. Side-by-Side Strategy Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Avalanche */}
        <div
          onClick={() => setSelectedStrategy('avalanche')}
          className={`cursor-pointer p-5 rounded-2xl border transition-all ${
            selectedStrategy === 'avalanche'
              ? 'bg-white border-blue-600 ring-2 ring-blue-500/20 shadow-md'
              : 'bg-white border-slate-200/80 hover:border-slate-300 opacity-90'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Debt Avalanche Strategy</h3>
                <span className="text-[11px] text-slate-500">Highest APR first (Optimal Math)</span>
              </div>
            </div>
            {selectedStrategy === 'avalanche' && (
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                Active View
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 my-3">
            <div className="p-3 bg-slate-50 rounded-xl">
              <div className="text-[11px] text-slate-500">Total Interest Cost</div>
              <div className="text-lg font-bold font-mono text-slate-900">
                {formatCurrency(avalancheResult.totalInterestPaid, currencySymbol)}
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <div className="text-[11px] text-slate-500">Debt-Free Date</div>
              <div className="text-lg font-bold font-mono text-blue-700">
                {avalancheResult.payoffDate}
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Targets high-interest rate balances aggressively. Saves{' '}
            <strong className="text-slate-900">
              {formatCurrency(Math.max(0, snowballResult.totalInterestPaid - avalancheResult.totalInterestPaid), currencySymbol)}
            </strong>{' '}
            more interest than Snowball.
          </p>
        </div>

        {/* Snowball */}
        <div
          onClick={() => setSelectedStrategy('snowball')}
          className={`cursor-pointer p-5 rounded-2xl border transition-all ${
            selectedStrategy === 'snowball'
              ? 'bg-white border-teal-600 ring-2 ring-teal-500/20 shadow-md'
              : 'bg-white border-slate-200/80 hover:border-slate-300 opacity-90'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-teal-100 text-teal-700 rounded-lg">
                <Snowflake className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Debt Snowball Strategy</h3>
                <span className="text-[11px] text-slate-500">Lowest Balance first (Momentum)</span>
              </div>
            </div>
            {selectedStrategy === 'snowball' && (
              <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                Active View
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 my-3">
            <div className="p-3 bg-slate-50 rounded-xl">
              <div className="text-[11px] text-slate-500">Total Interest Cost</div>
              <div className="text-lg font-bold font-mono text-slate-900">
                {formatCurrency(snowballResult.totalInterestPaid, currencySymbol)}
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <div className="text-[11px] text-slate-500">Debt-Free Date</div>
              <div className="text-lg font-bold font-mono text-teal-700">
                {snowballResult.payoffDate}
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Eliminates individual debt accounts fastest. Gives immediate psychological wins by clearing small accounts completely.
          </p>
        </div>

      </div>

      {/* 3. Debt Accounts Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Active Debt Obligations</h3>
            <p className="text-xs text-slate-500">Priority order based on {selectedStrategy.toUpperCase()} rules</p>
          </div>
          <button
            onClick={() => setShowAddDebtModal(true)}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>+ Add Another Debt</span>
          </button>
        </div>

        {debts.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-200/60">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-900">Zero Debt Obligations!</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              You currently have no active consumer debt recorded. All surplus cash can go directly to investments and wealth goals!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-medium">
                  <th className="pb-3 pl-2">Account Name</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3 text-right">APR %</th>
                  <th className="pb-3 text-right">Remaining Balance</th>
                  <th className="pb-3 text-right">Min Payment</th>
                  <th className="pb-3 text-right pr-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[...debts]
                  .sort((a, b) =>
                    selectedStrategy === 'avalanche'
                      ? b.interestRate - a.interestRate
                      : a.balance - b.balance
                  )
                  .map((d, index) => (
                    <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 pl-2 font-medium text-slate-900 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-100 font-mono text-[10px] flex items-center justify-center font-bold text-slate-600">
                          {index + 1}
                        </span>
                        <span>{d.name}</span>
                      </td>
                      <td className="py-3 text-slate-500 capitalize">
                        {d.category.replace('_', ' ')}
                      </td>
                      <td className="py-3 text-right font-mono font-semibold text-rose-600">
                        {d.interestRate}%
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(d.balance, currencySymbol)}
                      </td>
                      <td className="py-3 text-right font-mono text-slate-600">
                        {formatCurrency(d.minimumPayment, currencySymbol)}/mo
                      </td>
                      <td className="py-3 text-right pr-2">
                        <button
                          onClick={() => deleteDebt(d.id)}
                          className="p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Delete Debt"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Payoff Schedule Timeline Snapshot */}
      {activeResult.monthlySchedule.length > 0 && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Payoff Milestones Timeline</h3>
              <p className="text-xs text-slate-500">
                Simulated balance reduction over {activeResult.totalMonths} months
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
              Goal: {activeResult.payoffDate}
            </span>
          </div>

          <div className="space-y-2">
            {activeResult.monthlySchedule
              .filter((_, i) => i % 6 === 0 || i === activeResult.monthlySchedule.length - 1)
              .slice(0, 8)
              .map((step) => {
                const percentDone = Math.max(
                  0,
                  Math.min(100, Math.round(((totalBalance - step.remainingBalance) / totalBalance) * 100))
                );

                return (
                  <div key={step.month} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-900">{step.yearMonth}</span>
                      <span className="text-[11px] text-slate-500 font-mono">(Month {step.month})</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-32 hidden sm:block">
                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-600 rounded-full"
                            style={{ width: `${percentDone}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-slate-900">
                          {formatCurrency(step.remainingBalance, currencySymbol)}
                        </span>
                        <span className="text-[10px] text-slate-400 block">remaining</span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Add Debt Modal */}
      {showAddDebtModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add Debt Obligation</h3>
              <button
                onClick={() => setShowAddDebtModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDebt} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Debt Name / Institution
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chase Sapphire Card, Honda Auto Loan"
                  value={debtName}
                  onChange={(e) => setDebtName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Debt Type
                </label>
                <select
                  value={debtCat}
                  onChange={(e) => setDebtCat(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none bg-white"
                >
                  <option value="credit_card">Credit Card (High APR)</option>
                  <option value="car_loan">Auto / Vehicle Loan</option>
                  <option value="student_loan">Student Loan</option>
                  <option value="personal_loan">Personal / Consolidation Loan</option>
                  <option value="mortgage">Mortgage / Property</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Current Balance ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    placeholder="4500"
                    value={debtBalance}
                    onChange={(e) => setDebtBalance(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Interest Rate (APR %)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="19.99"
                    value={debtRate}
                    onChange={(e) => setDebtRate(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Minimum Monthly Payment ({currencySymbol})
                </label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  placeholder="120"
                  value={debtMin}
                  onChange={(e) => setDebtMin(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddDebtModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
                >
                  Add Debt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
