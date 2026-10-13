import React, { useState, useRef } from 'react';
import {
  LayoutDashboard,
  PieChart,
  TrendingDown,
  Target,
  LineChart,
  Receipt,
  Sparkles,
  Download,
  Upload,
  RotateCcw,
  User,
  Check,
  ChevronDown
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { PRESET_PROFILES } from '../utils/mockPresets';
import { formatCurrency } from '../utils/calculations';

const CURRENCIES = [
  { symbol: '$', code: 'USD', label: 'USD ($)' },
  { symbol: '€', code: 'EUR', label: 'EUR (€)' },
  { symbol: '£', code: 'GBP', label: 'GBP (£)' },
  { symbol: '¥', code: 'JPY', label: 'JPY (¥)' },
  { symbol: '₹', code: 'INR', label: 'INR (₹)' },
  { symbol: 'C$', code: 'CAD', label: 'CAD (C$)' },
  { symbol: 'A$', code: 'AUD', label: 'AUD (A$)' },
];

export const Header: React.FC<{
  onOpenNewTx: () => void;
  onOpenEditProfile: () => void;
}> = ({ onOpenNewTx, onOpenEditProfile }) => {
  const {
    profile,
    currencySymbol,
    setCurrency,
    activeTab,
    setActiveTab,
    openAIWithTab,
    loadPreset,
    resetToDefault,
    exportJSON,
    importJSON,
  } = useFinance();

  const [showPresets, setShowPresets] = useState(false);
  const [showCurrencies, setShowCurrencies] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importJSON(content);
        if (!success) {
          alert('Invalid financial backup file format.');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'budget', label: '50/30/20 Budget', icon: PieChart },
    { id: 'debts', label: 'Debt Payoff', icon: TrendingDown },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'simulator', label: 'Wealth Simulator', icon: LineChart },
    { id: 'transactions', label: 'Ledger', icon: Receipt },
  ] as const;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
              <span className="font-mono font-bold text-lg text-emerald-400">SM</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none">
                  Smart Money Planner
                </h1>
                <span className="text-xs text-slate-400 font-mono">v2.5</span>
              </div>
              <p className="text-xs text-slate-500 font-normal hidden sm:block">
                Cash Flow · Debt Snowball · Wealth Projections
              </p>
            </div>
          </div>

          {/* Quick Stats & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Currency Selector */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowCurrencies(!showCurrencies);
                  setShowPresets(false);
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                title="Change display currency"
              >
                <span>{profile.currency || 'USD'} ({currencySymbol})</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {showCurrencies && (
                <div className="absolute right-0 mt-2 w-36 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-50">
                  <div className="text-[10px] uppercase font-semibold text-slate-400 px-2 py-1">Currency</div>
                  {CURRENCIES.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => {
                        setCurrency(c.symbol, c.code);
                        setShowCurrencies(false);
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                    >
                      <span>{c.label}</span>
                      {currencySymbol === c.symbol && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Presets Switcher */}
            <div className="relative hidden md:block">
              <button
                onClick={() => {
                  setShowPresets(!showPresets);
                  setShowCurrencies(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <span>Profile Preset</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {showPresets && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-50">
                  <div className="text-[10px] uppercase font-semibold text-slate-400 px-2 py-1">
                    Load Realistic Scenario
                  </div>
                  {PRESET_PROFILES.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        loadPreset(preset.id);
                        setShowPresets(false);
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-slate-100 transition-colors group"
                    >
                      <div className="text-xs font-semibold text-slate-800 group-hover:text-emerald-700">
                        {preset.name}
                      </div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">
                        {preset.tagline}
                      </div>
                    </button>
                  ))}
                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <button
                      onClick={() => {
                        resetToDefault();
                        setShowPresets(false);
                      }}
                      className="w-full flex items-center gap-2 p-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                      <span>Reset to Balanced Defaults</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Export / Import */}
            <div className="hidden lg:flex items-center gap-1 border-l border-slate-200 pl-2">
              <button
                onClick={exportJSON}
                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                title="Export Financial Data (JSON)"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                title="Import Financial Data (JSON)"
              >
                <Upload className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Profile Income Quick Edit */}
            <button
              onClick={onOpenEditProfile}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
            >
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-medium hidden sm:inline">{profile.name}</span>
              <span className="font-mono text-slate-500">
                {formatCurrency(profile.monthlyIncome, currencySymbol)}/mo
              </span>
            </button>

            {/* AI Advisor Trigger */}
            <button
              onClick={() => openAIWithTab('audit')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-950 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-lg transition-colors shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>AI Advisor</span>
            </button>

            {/* Add Transaction Button */}
            <button
              onClick={onOpenNewTx}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-2xs"
            >
              <span>+ Record</span>
            </button>

          </div>
        </div>

        {/* Navigation Tabs (Zero-pill, clean segmented controls) */}
        <div className="flex items-center gap-1 overflow-x-auto py-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none border-t border-slate-100">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
