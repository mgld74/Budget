import React, { useState, useMemo } from 'react';
import {
  LineChart,
  TrendingUp,
  Sparkles,
  Zap,
  Info,
  Sliders,
  DollarSign,
  Calendar,
  Award,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { calculateWealthProjection, formatCurrency } from '../utils/calculations';

export const WealthSimulator: React.FC = () => {
  const { profile, currencySymbol, budgetStats, openAIWithTab } = useFinance();

  // Interactive controls
  const [initialNetWorth, setInitialNetWorth] = useState<number>(profile.investments + profile.liquidSavings);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(
    Math.max(100, Math.round(budgetStats.monthlySurplus * 0.75) || 500)
  );
  const [annualReturnRate, setAnnualReturnRate] = useState<number>(8.0);
  const [inflationRate, setInflationRate] = useState<number>(2.5);
  const [projectionYears, setProjectionYears] = useState<number>(20);

  // Scenario toggles
  const [careerPromotion, setCareerPromotion] = useState<boolean>(false); // +$500/mo after yr 3
  const [marketDownturn, setMarketDownturn] = useState<boolean>(false); // -15% one-time dip yr 4

  // Compute projection
  const projection = useMemo(() => {
    const raw = calculateWealthProjection(
      initialNetWorth,
      monthlyContribution + (careerPromotion ? 400 : 0),
      annualReturnRate - (marketDownturn ? 0.8 : 0),
      inflationRate,
      projectionYears
    );
    return raw;
  }, [
    initialNetWorth,
    monthlyContribution,
    careerPromotion,
    marketDownturn,
    annualReturnRate,
    inflationRate,
    projectionYears,
  ]);

  const finalYear = projection[projection.length - 1];
  const compoundSharePercent = finalYear
    ? Math.round((finalYear.compoundGains / finalYear.nominalValue) * 100)
    : 0;

  // Find milestones
  const milestone100k = projection.find((p) => p.nominalValue >= 100000);
  const milestone500k = projection.find((p) => p.nominalValue >= 500000);
  const milestone1M = projection.find((p) => p.nominalValue >= 1000000);

  return (
    <div className="space-y-6 pb-12">
      
      {/* 1. Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">Compound Wealth & Horizon Simulator</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800">
                Long-Term Projection
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulate compound growth, market return scenarios, and inflation-adjusted purchasing power.
            </p>
          </div>

          <button
            onClick={() => openAIWithTab('chat')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors border border-emerald-300"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>AI Retirement Stress Test</span>
          </button>
        </div>

        {/* Big Future Outcomes KPI */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="p-4 bg-slate-900 text-white rounded-xl">
            <div className="text-xs text-slate-400 font-medium">
              Portfolio Value at Year {projectionYears}
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
              {formatCurrency(finalYear?.nominalValue || 0, currencySymbol)}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Real purchasing power: {formatCurrency(finalYear?.realValue || 0, currencySymbol)}
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-xs text-slate-500 font-medium">Your Direct Contributions</div>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
              {formatCurrency(finalYear?.totalContributed || 0, currencySymbol)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {formatCurrency(monthlyContribution, currencySymbol)}/month consistently
            </div>
          </div>

          <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-100">
            <div className="text-xs text-emerald-800 font-medium">Compound Interest Earned</div>
            <div className="text-2xl font-bold font-mono text-emerald-950 mt-1">
              {formatCurrency(finalYear?.compoundGains || 0, currencySymbol)}
            </div>
            <div className="text-[11px] text-emerald-700 mt-0.5 font-medium">
              {compoundSharePercent}% of portfolio is pure compound gain!
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Control Sliders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sliders Panel */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-5">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-slate-500" />
            <span>Growth Parameters</span>
          </h3>

          {/* Monthly Contribution */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600 font-medium">Monthly Investment</span>
              <span className="font-mono font-bold text-slate-900">
                {formatCurrency(monthlyContribution, currencySymbol)}/mo
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="4000"
              step="50"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(parseFloat(e.target.value) || 0)}
              className="w-full accent-slate-900 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Expected Return Rate */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600 font-medium">Annual Market Return</span>
              <span className="font-mono font-bold text-emerald-700">{annualReturnRate}%</span>
            </div>
            <input
              type="range"
              min="2"
              max="14"
              step="0.5"
              value={annualReturnRate}
              onChange={(e) => setAnnualReturnRate(parseFloat(e.target.value) || 0)}
              className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>Conservative (5%)</span>
              <span>S&P Index (8%)</span>
              <span>Aggressive (11%)</span>
            </div>
          </div>

          {/* Inflation Rate */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600 font-medium">Annual Inflation Rate</span>
              <span className="font-mono font-bold text-slate-700">{inflationRate}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="6"
              step="0.25"
              value={inflationRate}
              onChange={(e) => setInflationRate(parseFloat(e.target.value) || 0)}
              className="w-full accent-slate-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Time Horizon Buttons */}
          <div>
            <div className="text-xs text-slate-600 font-medium mb-1.5">Simulation Horizon</div>
            <div className="grid grid-cols-4 gap-1.5">
              {[5, 10, 20, 30].map((yrs) => (
                <button
                  key={yrs}
                  onClick={() => setProjectionYears(yrs)}
                  className={`py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                    projectionYears === yrs
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {yrs} yrs
                </button>
              ))}
            </div>
          </div>

          {/* Life Event Scenario Toggles */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="text-xs font-bold text-slate-900">Life Event Scenarios</div>
            
            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={careerPromotion}
                onChange={(e) => setCareerPromotion(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>Career Promotion (+{formatCurrency(400, currencySymbol)}/mo)</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={marketDownturn}
                onChange={(e) => setMarketDownturn(e.target.checked)}
                className="rounded text-rose-600 focus:ring-rose-500"
              />
              <span>Market Volatility Drag (-0.8% net return)</span>
            </label>
          </div>
        </div>

        {/* Milestones & Horizon Timeline Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3">Projected Wealth Milestones</h3>

            {/* Milestones cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Award className="w-3 h-3 text-amber-500" />
                  <span>First $100K Club</span>
                </div>
                <div className="text-base font-bold font-mono text-slate-900 mt-1">
                  {milestone100k ? `Year ${milestone100k.year} (~${milestone100k.yearsFromNow} yrs)` : 'Extend horizon'}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Award className="w-3 h-3 text-blue-500" />
                  <span>$500K Half-Million</span>
                </div>
                <div className="text-base font-bold font-mono text-slate-900 mt-1">
                  {milestone500k ? `Year ${milestone500k.year} (~${milestone500k.yearsFromNow} yrs)` : 'Extend horizon'}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Award className="w-3 h-3 text-emerald-500" />
                  <span>$1,000,000 Milestone</span>
                </div>
                <div className="text-base font-bold font-mono text-slate-900 mt-1">
                  {milestone1M ? `Year ${milestone1M.year} (~${milestone1M.yearsFromNow} yrs)` : 'Extend horizon'}
                </div>
              </div>
            </div>

            {/* Step-by-Step Trajectory Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-medium">
                    <th className="pb-2.5">Timeline</th>
                    <th className="pb-2.5 text-right">Contributed</th>
                    <th className="pb-2.5 text-right">Compound Gains</th>
                    <th className="pb-2.5 text-right">Portfolio Value</th>
                    <th className="pb-2.5 text-right text-slate-400">Real (Inflation-Adj)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {projection
                    .filter((p) => p.yearsFromNow <= 5 || p.yearsFromNow % 5 === 0 || p.yearsFromNow === projectionYears)
                    .map((item) => (
                      <tr key={item.year} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 font-semibold text-slate-900">
                          {item.year} <span className="text-[11px] text-slate-400 font-normal">(+{item.yearsFromNow}y)</span>
                        </td>
                        <td className="py-2.5 text-right font-mono text-slate-600">
                          {formatCurrency(item.totalContributed, currencySymbol)}
                        </td>
                        <td className="py-2.5 text-right font-mono text-emerald-600 font-semibold">
                          +{formatCurrency(item.compoundGains, currencySymbol)}
                        </td>
                        <td className="py-2.5 text-right font-mono font-bold text-slate-900">
                          {formatCurrency(item.nominalValue, currencySymbol)}
                        </td>
                        <td className="py-2.5 text-right font-mono text-slate-400">
                          {formatCurrency(item.realValue, currencySymbol)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs text-slate-600 flex items-start gap-2">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <strong>Rule of 72 Context:</strong> At {annualReturnRate}% annual return, your capital doubles approximately every{' '}
              {Math.round(72 / Math.max(1, annualReturnRate))} years without needing any extra deposits.
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
