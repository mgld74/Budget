import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  HelpCircle,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  ShieldAlert,
  Loader2,
  RefreshCw,
  MessageSquare,
  Activity,
  DollarSign,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { AIAuditResult } from '../types/finance';
import { formatCurrency } from '../utils/calculations';

export const AIAssistantModal: React.FC = () => {
  const {
    isAIOpen,
    setIsAIOpen,
    aiInitialTab,
    profile,
    currencySymbol,
    healthBreakdown,
    budgetStats,
    debts,
    goals,
  } = useFinance();

  const [activeTab, setActiveTab] = useState<'audit' | 'stress' | 'chat'>('audit');

  // Sync tab on open
  useEffect(() => {
    if (isAIOpen) {
      setActiveTab(aiInitialTab);
    }
  }, [isAIOpen, aiInitialTab]);

  // Tab 1: Audit State
  const [auditResult, setAuditResult] = useState<AIAuditResult | null>(null);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [auditError, setAuditError] = useState<string | null>(null);

  // Tab 2: Stress Test State
  const [stressDesc, setStressDesc] = useState<string>('');
  const [stressCost, setStressCost] = useState<string>('');
  const [stressResult, setStressResult] = useState<any | null>(null);
  const [isStressTesting, setIsStressTesting] = useState<boolean>(false);

  // Tab 3: Chat State
  const [chatMessages, setChatMessages] = useState<
    { role: 'user' | 'assistant'; text: string }[]
  >([
    {
      role: 'assistant',
      text: `Hello ${profile.name}! I am your Smart Money Advisor. Ask me anything about rebalancing your 50/30/20 budget, optimizing debt payoff, or accelerating your savings goals!`,
    },
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  // Build financial snapshot for server
  const financialSummary = {
    userName: profile.name,
    monthlyIncome: profile.monthlyIncome,
    totalMonthlyExpenses: budgetStats.totalMonthlySpent,
    monthlySavings: budgetStats.monthlySurplus,
    savingsRate: healthBreakdown.savingsRate,
    needsTotal: budgetStats.totalNeedsSpent,
    needsPercent: budgetStats.needsPercent,
    wantsTotal: budgetStats.totalWantsSpent,
    wantsPercent: budgetStats.wantsPercent,
    totalDebt: debts.reduce((s, d) => s + d.balance, 0),
    debtsList: debts.map((d) => ({ name: d.name, balance: d.balance, apr: d.interestRate })),
    emergencySavings: profile.liquidSavings,
    runwayMonths: healthBreakdown.runwayMonths,
    investments: profile.investments,
    goals: goals.map((g) => ({ title: g.title, target: g.targetAmount, current: g.currentAmount })),
  };

  // Run Audit
  const handleRunAudit = async () => {
    setIsAuditing(true);
    setAuditError(null);
    try {
      const res = await fetch('/api/ai/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ financialSummary }),
      });
      const data = await res.json();
      if (data.analysis) {
        setAuditResult(data.analysis);
      } else {
        setAuditError('Could not process analysis.');
      }
    } catch (err: any) {
      setAuditError(err.message || 'Failed to reach AI service.');
    } finally {
      setIsAuditing(false);
    }
  };

  // Run Stress Test
  const handleRunStressTest = async (e: React.FormEvent) => {
    e.preventDefault();
    const cost = parseFloat(stressCost);
    if (!stressDesc.trim() || isNaN(cost) || cost <= 0) return;

    setIsStressTesting(true);
    setStressResult(null);

    try {
      const res = await fetch('/api/ai/stress-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario: { description: stressDesc, cost },
          financialSummary,
        }),
      });
      const data = await res.json();
      setStressResult(data.analysis || data);
    } catch (err: any) {
      setStressResult({
        canAffordVerdict: 'Evaluation unavailable',
        cashFlowImpact: 'Could not contact analyzer service.',
        tradeOffs: [],
        safeAlternative: 'Review monthly surplus manually.',
      });
    } finally {
      setIsStressTesting(false);
    }
  };

  // Send Chat Message
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isChatLoading) return;

    const newHistory = [...chatMessages, { role: 'user' as const, text: text.trim() }];
    setChatMessages(newHistory);
    setInputMessage('');
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          financialSummary,
          history: newHistory,
        }),
      });
      const data = await res.json();
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', text: data.reply || 'Analysis completed.' },
      ]);
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'I could not connect to the analysis engine right now. Please verify server connectivity or review local projections.',
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  if (!isAIOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 sm:p-6">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <Sparkles className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">AI Financial Copilot</h2>
              <p className="text-xs text-slate-500">
                Personalized diagnostics, affordability tests & strategic advice
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAIOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-100 text-xs">
          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-1.5 px-3 py-2 font-semibold border-b-2 transition-all ${
              activeTab === 'audit'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Health Audit</span>
          </button>

          <button
            onClick={() => setActiveTab('stress')}
            className={`flex items-center gap-1.5 px-3 py-2 font-semibold border-b-2 transition-all ${
              activeTab === 'stress'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Affordability Stress-Test</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 px-3 py-2 font-semibold border-b-2 transition-all ${
              activeTab === 'chat'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Financial Advisor Chat</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: AUDIT */}
          {activeTab === 'audit' && (
            <div className="space-y-6">
              {!auditResult && !isAuditing && (
                <div className="text-center py-10 px-4">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Activity className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Comprehensive Financial Health Diagnostic
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
                    Our AI will analyze your income ({formatCurrency(profile.monthlyIncome, currencySymbol)}/mo), {budgetStats.needsPercent.toFixed(0)}% needs, {debts.length} active debts, and liquid reserves to generate a prioritized 3-step action roadmap.
                  </p>
                  <button
                    onClick={handleRunAudit}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-xs"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Run Full Financial Audit</span>
                  </button>
                </div>
              )}

              {isAuditing && (
                <div className="text-center py-16">
                  <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
                  <h4 className="text-sm font-bold text-slate-900">
                    Auditing Cash Flow & Repayment Ratios...
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Benchmarking against wealth-building models
                  </p>
                </div>
              )}

              {auditResult && !isAuditing && (
                <div className="space-y-5">
                  {/* Verdict Banner */}
                  <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-start justify-between gap-4">
                    <div>
                      <div className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider font-semibold">
                        Advisor Verdict
                      </div>
                      <h3 className="text-base font-bold text-white mt-1">
                        {auditResult.financialHealthVerdict}
                      </h3>
                      <p className="text-xs text-slate-300 mt-1">
                        {auditResult.budgetRuleFeedback}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-2xl font-mono font-extrabold text-emerald-400">
                        {auditResult.healthScore}/100
                      </div>
                      <div className="text-[10px] text-slate-400">Health Index</div>
                    </div>
                  </div>

                  {/* Prioritized Actions */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                      Prioritized High-Impact Actions
                    </h4>
                    <div className="space-y-2.5">
                      {auditResult.prioritizedActions?.map((act, i) => (
                        <div
                          key={i}
                          className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-start justify-between gap-3 text-xs"
                        >
                          <div className="space-y-0.5">
                            <div className="font-semibold text-slate-900 flex items-center gap-2">
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                  act.priority === 'High'
                                    ? 'bg-rose-100 text-rose-800'
                                    : act.priority === 'Medium'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-slate-200 text-slate-700'
                                }`}
                              >
                                {act.priority} Priority
                              </span>
                              <span>{act.action}</span>
                            </div>
                            <div className="text-slate-500 text-[11px]">
                              Impact: {act.impact}
                            </div>
                          </div>
                          <span className="text-[10px] font-medium text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md shrink-0">
                            {act.effort}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Key Observations */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                      Diagnostic Observations
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {auditResult.keyObservations?.map((obs, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 text-xs"
                        >
                          <div className="font-bold text-slate-900 mb-0.5 flex items-center gap-1.5">
                            {obs.type === 'positive' && (
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            )}
                            {obs.type === 'warning' && (
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            )}
                            {obs.type === 'neutral' && (
                              <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                            )}
                            <span>{obs.title}</span>
                          </div>
                          <p className="text-slate-600 text-[11px] leading-relaxed">
                            {obs.detail}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Refresh Button */}
                  <div className="text-center pt-2">
                    <button
                      onClick={handleRunAudit}
                      className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Re-analyze Current Numbers</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: STRESS TEST */}
          {activeTab === 'stress' && (
            <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  "Can I Afford This?" Scenario Simulator
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Test a major one-time expense or new recurring commitment against your current monthly surplus of{' '}
                  <strong className="font-mono text-slate-900">
                    {formatCurrency(budgetStats.monthlySurplus, currencySymbol)}
                  </strong>{' '}
                  and emergency buffer.
                </p>

                <form onSubmit={handleRunStressTest} className="mt-4 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Purchase / Commitment Description
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 2-week European vacation, New car lease with insurance"
                      value={stressDesc}
                      onChange={(e) => setStressDesc(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Estimated Cost ({currencySymbol})
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="any"
                      placeholder="1800"
                      value={stressCost}
                      onChange={(e) => setStressCost(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none bg-white"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isStressTesting}
                    className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {isStressTesting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Simulating Impact...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Run Affordability Stress-Test</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {stressResult && (
                <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Evaluation Outcome
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800">
                      {stressResult.canAffordVerdict || stressResult.verdict}
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 leading-relaxed">
                    {stressResult.cashFlowImpact || stressResult.impact}
                  </div>

                  {stressResult.tradeOffs && stressResult.tradeOffs.length > 0 && (
                    <div className="pt-2">
                      <div className="text-[11px] font-semibold text-slate-900 mb-1">
                        Tradeoffs to consider:
                      </div>
                      <ul className="list-disc pl-4 text-xs text-slate-600 space-y-1">
                        {stressResult.tradeOffs.map((t: string, i: number) => (
                          <li key={i}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {stressResult.safeAlternative && (
                    <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 text-xs text-emerald-900">
                      <strong>Advisor Recommendation:</strong> {stressResult.safeAlternative || stressResult.recommendation}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CHAT */}
          {activeTab === 'chat' && (
            <div className="flex flex-col h-[420px]">
              {/* Message scroll container */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-slate-900 text-white rounded-br-xs'
                          : 'bg-slate-100 text-slate-800 rounded-bl-xs whitespace-pre-line'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}

                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 text-slate-500 p-3 rounded-2xl text-xs flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Thinking with your portfolio data...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Questions chips */}
              <div className="py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                <button
                  onClick={() => handleSendMessage('Should I prioritize paying off debt or investing in the S&P 500?')}
                  className="px-2.5 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg whitespace-nowrap transition-colors"
                >
                  Debt vs S&P 500?
                </button>
                <button
                  onClick={() => handleSendMessage('How can I optimize my 50/30/20 budget to save $200 more per month?')}
                  className="px-2.5 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg whitespace-nowrap transition-colors"
                >
                  Save $200 more?
                </button>
                <button
                  onClick={() => handleSendMessage('Is my emergency fund sufficient for unexpected job loss?')}
                  className="px-2.5 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg whitespace-nowrap transition-colors"
                >
                  Emergency buffer test?
                </button>
              </div>

              {/* Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="pt-2 flex items-center gap-2 border-t border-slate-100"
              >
                <input
                  type="text"
                  placeholder="Ask any personal finance question..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                />
                <button
                  type="submit"
                  disabled={isChatLoading || !inputMessage.trim()}
                  className="p-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
