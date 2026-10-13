import React, { useState } from 'react';
import {
  Wallet,
  TrendingUp,
  ShieldCheck,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Plus,
  Target,
  Zap,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatPercent } from '../utils/calculations';

export const Dashboard: React.FC<{
  onOpenNewTx: () => void;
  onOpenEditProfile: () => void;
}> = ({ onOpenNewTx, onOpenEditProfile }) => {
  const {
    profile,
    currencySymbol,
    healthBreakdown,
    budgetStats,
    debts,
    goals,
    categoryBudgets,
    contributeToGoal,
    openAIWithTab,
    setActiveTab,
  } = useFinance();

  const [quickImpulseAmount, setQuickImpulseAmount] = useState<string>('');
  const [quickImpulseItem, setQuickImpulseItem] = useState<string>('');
  const [impulseFeedback, setImpulseFeedback] = useState<string | null>(null);

  const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0);
  const totalMinDebtPayment = debts.reduce((sum, d) => sum + d.minimumPayment, 0);

  // Impulse check evaluation
  const handleImpulseCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const cost = parseFloat(quickImpulseAmount);
    if (isNaN(cost) || cost <= 0) return;

    const surplus = budgetStats.monthlySurplus;
    const itemLabel = quickImpulseItem.trim() || 'this purchase';

    if (cost <= surplus * 0.15) {
      setImpulseFeedback(
        `✅ Green Light: ${formatCurrency(cost, currencySymbol)} is well within your monthly surplus (${formatCurrency(surplus, currencySymbol)} remaining). Go ahead without financial stress!`
      );
    } else if (cost <= surplus) {
      setImpulseFeedback(
        `⚠️ Moderate Impact: ${formatCurrency(cost, currencySymbol)} uses ${Math.round((cost / surplus) * 100)}% of this month's remaining surplus. It won't cause debt, but consider delaying by 24 hours to be sure.`
      );
    } else {
      setImpulseFeedback(
        `🚨 High Friction: ${formatCurrency(cost, currencySymbol)} exceeds your monthly discretionary surplus of ${formatCurrency(surplus, currencySymbol)}. Buying ${itemLabel} now would dip into your emergency savings or increase debt.`
      );
    }
  };

  // Top spending categories
  const topCategories = categoryBudgets
    .map((cat) => {
      const spent = budgetStats.spentByCategory[cat.name] || 0;
      const ratio = cat.budgetLimit > 0 ? (spent / cat.budgetLimit) * 100 : 0;
      return { ...cat, spent, ratio };
    })
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 5);

  return (
    <div className="space-y-6 pb-12">
      
      {/* 1. Top Executive KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Net Worth */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
            <span>Estimated Net Worth</span>
            <div className="p-1.5 bg-slate-100 rounded-lg text-slate-700">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
            {formatCurrency(healthBreakdown.totalNetWorth, currencySymbol)}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <span>Assets: {formatCurrency(profile.liquidSavings + profile.investments, currencySymbol)}</span>
            <span aria-hidden="true">·</span>
            <span className="text-rose-600">Debt: -{formatCurrency(totalDebt, currencySymbol)}</span>
          </div>
        </div>

        {/* Monthly Surplus & Savings Rate */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
            <span>Monthly Cash Flow Surplus</span>
            <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
              {formatCurrency(budgetStats.monthlySurplus, currencySymbol)}
            </span>
            <span className="text-xs font-semibold text-emerald-600 font-mono">
              {healthBreakdown.savingsRate}% saved
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Income {formatCurrency(profile.monthlyIncome, currencySymbol)} vs Outflow {formatCurrency(budgetStats.totalMonthlySpent, currencySymbol)}
          </div>
        </div>

        {/* Emergency Runway */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
            <span>Emergency Runway</span>
            <div className="p-1.5 bg-teal-50 rounded-lg text-teal-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
              {healthBreakdown.runwayMonths}
            </span>
            <span className="text-xs text-slate-500 font-medium">months</span>
          </div>
          <div className="mt-2 text-xs flex items-center gap-1">
            {healthBreakdown.runwayMonths >= 6 ? (
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Strong 6+ mo safety vault
              </span>
            ) : healthBreakdown.runwayMonths >= 3 ? (
              <span className="text-teal-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Healthy 3+ mo foundation
              </span>
            ) : (
              <span className="text-amber-700 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Under 3 mo buffer recommended
              </span>
            )}
          </div>
        </div>

        {/* Debt Load */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
            <span>Total Outstanding Debt</span>
            <div className="p-1.5 bg-rose-50 rounded-lg text-rose-600">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
            {formatCurrency(totalDebt, currencySymbol)}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>{debts.length} active account{debts.length === 1 ? '' : 's'}</span>
            <span className="font-mono">{formatCurrency(totalMinDebtPayment, currencySymbol)}/mo min</span>
          </div>
        </div>

      </div>

      {/* 2. Financial Health Score & 50/30/20 Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Health Score Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Financial Health Score</h2>
                <p className="text-xs text-slate-500">Holistic multi-pillar financial rating</p>
              </div>
              <button
                onClick={() => openAIWithTab('audit')}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>AI Audit</span>
              </button>
            </div>

            <div className="flex items-center gap-4 my-2">
              <div className="relative flex items-center justify-center w-20 h-20 rounded-full border-4 border-slate-100 bg-slate-50">
                <div className="text-center">
                  <span className="text-2xl font-extrabold font-mono text-slate-900">
                    {healthBreakdown.score}
                  </span>
                  <span className="block text-[10px] text-slate-400 font-medium">/ 100</span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-slate-900">
                    Grade {healthBreakdown.grade}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-md font-semibold bg-slate-100 text-slate-700">
                    {healthBreakdown.score >= 80 ? 'Robust' : healthBreakdown.score >= 60 ? 'Stable' : 'Needs Tuning'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {healthBreakdown.score >= 80
                    ? 'Excellent savings trajectory and controlled debt exposure.'
                    : healthBreakdown.score >= 60
                    ? 'Solid base. Focus on boosting liquid emergency runway and paying down high APR debts.'
                    : 'Discretionary outflows or debt minimums are compressing your growth margin.'}
                </p>
              </div>
            </div>

            {/* Pillar Breakdown Bars */}
            <div className="mt-5 space-y-2.5">
              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Savings Velocity ({healthBreakdown.savingsRate}%)</span>
                  <span className="font-mono text-slate-900">{healthBreakdown.savingsRateScore}/30</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${(healthBreakdown.savingsRateScore / 30) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Emergency Cushion ({healthBreakdown.runwayMonths} mo)</span>
                  <span className="font-mono text-slate-900">{healthBreakdown.emergencyRunwayScore}/30</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-500 rounded-full transition-all duration-500"
                    style={{ width: `${(healthBreakdown.emergencyRunwayScore / 30) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Needs vs Wants Balance</span>
                  <span className="font-mono text-slate-900">{healthBreakdown.needsWantsRatioScore}/25</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${(healthBreakdown.needsWantsRatioScore / 25) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Debt Health</span>
                  <span className="font-mono text-slate-900">{healthBreakdown.debtBurdenScore}/15</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${(healthBreakdown.debtBurdenScore / 15) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => openAIWithTab('audit')}
            className="mt-5 w-full py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <span>View Full Diagnostic Report</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 50/30/20 Rule Distribution */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-sm font-bold text-slate-900">50 / 30 / 20 Budget Distribution</h2>
                <p className="text-xs text-slate-500">Live allocation vs balanced financial target</p>
              </div>
              <button
                onClick={() => setActiveTab('budget')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>Adjust Limits</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Visual Multi-segment Bar */}
            <div className="my-4">
              <div className="h-4 bg-slate-100 rounded-xl overflow-hidden flex shadow-inner">
                <div
                  className="bg-blue-600 transition-all duration-500"
                  style={{ width: `${Math.min(100, budgetStats.needsPercent)}%` }}
                  title={`Needs: ${formatPercent(budgetStats.needsPercent)}`}
                />
                <div
                  className="bg-amber-500 transition-all duration-500"
                  style={{ width: `${Math.min(100 - budgetStats.needsPercent, budgetStats.wantsPercent)}%` }}
                  title={`Wants: ${formatPercent(budgetStats.wantsPercent)}`}
                />
                <div
                  className="bg-emerald-500 transition-all duration-500"
                  style={{ width: `${Math.max(0, 100 - (budgetStats.needsPercent + budgetStats.wantsPercent))}%` }}
                  title={`Savings/Surplus: ${formatPercent(budgetStats.savingsPercent)}`}
                />
              </div>

              {/* Legend & Target Comparison */}
              <div className="grid grid-cols-3 gap-3 mt-4 text-xs">
                
                {/* Needs */}
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-1.5 font-semibold text-blue-900">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                    <span>Needs (Target: 50%)</span>
                  </div>
                  <div className="text-lg font-bold font-mono text-slate-900 mt-1">
                    {formatPercent(budgetStats.needsPercent)}
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    {formatCurrency(budgetStats.totalNeedsSpent, currencySymbol)} of {formatCurrency(profile.monthlyIncome * 0.5, currencySymbol)} limit
                  </div>
                </div>

                {/* Wants */}
                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
                  <div className="flex items-center gap-1.5 font-semibold text-amber-900">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                    <span>Wants (Target: 30%)</span>
                  </div>
                  <div className="text-lg font-bold font-mono text-slate-900 mt-1">
                    {formatPercent(budgetStats.wantsPercent)}
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    {formatCurrency(budgetStats.totalWantsSpent, currencySymbol)} of {formatCurrency(profile.monthlyIncome * 0.3, currencySymbol)} limit
                  </div>
                </div>

                {/* Savings & Investments */}
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                  <div className="flex items-center gap-1.5 font-semibold text-emerald-900">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                    <span>Savings (Target: 20%)</span>
                  </div>
                  <div className="text-lg font-bold font-mono text-slate-900 mt-1">
                    {formatPercent(budgetStats.savingsPercent)}
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    {formatCurrency(profile.monthlyIncome * (budgetStats.savingsPercent / 100), currencySymbol)} surplus & goals
                  </div>
                </div>

              </div>
            </div>

            {/* Smart Rebalance Insight Box */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-3 mt-4">
              <Zap className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <div className="text-xs text-slate-700">
                <span className="font-semibold text-slate-900">Live Rebalance Tip: </span>
                {budgetStats.needsPercent > 50 ? (
                  <span>Your essential fixed needs consume {formatPercent(budgetStats.needsPercent)} of income. Look into renegotiating utility rates or refinancing loans to free up $150-$300/mo.</span>
                ) : budgetStats.wantsPercent > 32 ? (
                  <span>Discretionary wants are slightly above the 30% mark. Dialing back dining and subscription leakage by {formatCurrency(120, currencySymbol)} will push your annual savings up by {formatCurrency(1440, currencySymbol)}.</span>
                ) : (
                  <span>Great discipline! Your allocations match standard wealth-building principles. Direct surplus cash into compound investment vehicles or fast-track debt payoffs.</span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Monthly Income Baseline: <strong className="font-mono text-slate-900">{formatCurrency(profile.monthlyIncome, currencySymbol)}</strong></span>
            <button
              onClick={onOpenEditProfile}
              className="text-slate-600 hover:text-slate-900 underline font-medium"
            >
              Update Income
            </button>
          </div>
        </div>

      </div>

      {/* 3. Lower Section: Goals Quick Progress & Impulse Stress-Test Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Active Goals & Quick Boost */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Active Goals & Milestones</h2>
              <p className="text-xs text-slate-500">Progress toward your targets with 1-click contributions</p>
            </div>
            <button
              onClick={() => setActiveTab('goals')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>View All Goals</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {goals.slice(0, 3).map((goal) => {
              const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
              const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

              return (
                <div key={goal.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div>
                      <div className="text-xs font-bold text-slate-900">{goal.title}</div>
                      <div className="text-[11px] text-slate-500">
                        Target: {formatCurrency(goal.targetAmount, currencySymbol)} · Due {new Date(goal.targetDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold font-mono text-slate-900">
                        {formatCurrency(goal.currentAmount, currencySymbol)}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {progress}% achieved
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  {/* Quick Boost Action */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-500">
                      {remaining > 0 ? `${formatCurrency(remaining, currencySymbol)} to go` : '🎉 Goal Completed!'}
                    </span>
                    {remaining > 0 && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => contributeToGoal(goal.id, 50)}
                          className="px-2 py-1 text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 shadow-2xs"
                        >
                          +50
                        </button>
                        <button
                          onClick={() => contributeToGoal(goal.id, 100)}
                          className="px-2 py-1 text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 shadow-2xs"
                        >
                          +100
                        </button>
                        <button
                          onClick={() => contributeToGoal(goal.id, 250)}
                          className="px-2 py-1 text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 shadow-2xs"
                        >
                          +250
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Debt Quick Payoff Callout */}
          {debts.length > 0 && (
            <div className="mt-5 p-3.5 bg-slate-900 text-white rounded-xl flex items-center justify-between">
              <div>
                <div className="text-xs font-bold flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-rose-400" />
                  <span>Debt Avalanche Payoff Strategy</span>
                </div>
                <div className="text-[11px] text-slate-300 mt-0.5">
                  You have {debts.length} active debt accounts. Pay off the highest APR balance first to save money.
                </div>
              </div>
              <button
                onClick={() => setActiveTab('debts')}
                className="px-3 py-1.5 text-xs font-semibold bg-emerald-400 text-slate-950 rounded-lg hover:bg-emerald-300 transition-colors whitespace-nowrap ml-4"
              >
                Simulate Payoff
              </button>
            </div>
          )}
        </div>

        {/* Right Col: "Can I Afford This?" Instant Impulse Stress-Tester */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-slate-100 rounded-lg text-slate-700">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">"Can I Afford This?"</h2>
                <p className="text-xs text-slate-500">Impulse check against live cash flow</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mt-2 mb-4 leading-relaxed">
              Evaluating an unplanned purchase? Test how it impacts your monthly budget surplus before checking out.
            </p>

            <form onSubmit={handleImpulseCheck} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Item or Experience
                </label>
                <input
                  type="text"
                  placeholder="e.g. Weekend Trip, Espresso Machine"
                  value={quickImpulseItem}
                  onChange={(e) => setQuickImpulseItem(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Price / Cost ({currencySymbol})
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-mono text-slate-400">{currencySymbol}</span>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    placeholder="350"
                    value={quickImpulseAmount}
                    onChange={(e) => setQuickImpulseAmount(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 px-3 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
              >
                Evaluate Impact
              </button>
            </form>

            {impulseFeedback && (
              <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 leading-relaxed">
                {impulseFeedback}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <button
              onClick={() => openAIWithTab('stress')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center justify-center gap-1 mx-auto"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Deep AI Scenario Simulator</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
