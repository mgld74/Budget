import React, { useState } from 'react';
import { X, User, DollarSign, Wallet, TrendingUp, Save } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

export const EditProfileModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { profile, setProfile, currencySymbol } = useFinance();

  const [name, setName] = useState(profile.name);
  const [income, setIncome] = useState(profile.monthlyIncome.toString());
  const [savings, setSavings] = useState(profile.liquidSavings.toString());
  const [investments, setInvestments] = useState(profile.investments.toString());

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const inc = parseFloat(income);
    const sav = parseFloat(savings);
    const inv = parseFloat(investments);

    if (!name.trim() || isNaN(inc) || inc <= 0) return;

    setProfile({
      name: name.trim(),
      monthlyIncome: inc,
      liquidSavings: isNaN(sav) ? 0 : sav,
      investments: isNaN(inv) ? 0 : inv,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Financial Profile Settings</h3>
            <p className="text-xs text-slate-500">Update baseline income and initial assets</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Your Name / Household
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Monthly Net Take-Home Income ({currencySymbol})
            </label>
            <input
              type="number"
              min="1"
              step="any"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
              required
            />
            <p className="text-[11px] text-slate-400 mt-1">
              After-tax salary, side hustles, and steady incoming distributions.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Liquid Cash ({currencySymbol})
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={savings}
                onChange={(e) => setSavings(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400">Emergency fund / checking</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Investments ({currencySymbol})
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={investments}
                onChange={(e) => setInvestments(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400">401(k), IRA, Brokerage</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
