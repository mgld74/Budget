import React, { useState } from 'react';
import { X, DollarSign, Calendar, Tag, FileText, Check } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { CategoryType } from '../types/finance';

export const NewTransactionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { addTransaction, currencySymbol, categoryBudgets } = useFinance();

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<'income' | CategoryType>('needs');
  const [category, setCategory] = useState(categoryBudgets[0]?.name || 'Housing & Rent');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!description.trim() || isNaN(val) || val <= 0) return;

    addTransaction({
      description: description.trim(),
      amount: val,
      date,
      type,
      category: type === 'income' ? 'Salary / Income' : category,
    });

    setDescription('');
    setAmount('');
    onClose();
  };

  const availableCategories = categoryBudgets.filter((c) =>
    type === 'needs'
      ? c.type === 'needs'
      : type === 'wants'
      ? c.type === 'wants'
      : type === 'savings'
      ? c.type === 'savings'
      : c.type === 'debt'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Record Transaction</h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Pillar / Transaction Type */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Transaction Classification
            </label>
            <div className="grid grid-cols-4 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setType('income')}
                className={`py-1.5 px-2 rounded-lg font-medium border text-center transition-colors ${
                  type === 'income'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                + Income
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('needs');
                  const first = categoryBudgets.find((c) => c.type === 'needs');
                  if (first) setCategory(first.name);
                }}
                className={`py-1.5 px-2 rounded-lg font-medium border text-center transition-colors ${
                  type === 'needs'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Needs
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('wants');
                  const first = categoryBudgets.find((c) => c.type === 'wants');
                  if (first) setCategory(first.name);
                }}
                className={`py-1.5 px-2 rounded-lg font-medium border text-center transition-colors ${
                  type === 'wants'
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Wants
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('savings');
                  const first = categoryBudgets.find((c) => c.type === 'savings' || c.type === 'debt');
                  if (first) setCategory(first.name);
                }}
                className={`py-1.5 px-2 rounded-lg font-medium border text-center transition-colors ${
                  type === 'savings'
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Savings
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Description / Merchant
            </label>
            <input
              type="text"
              placeholder="e.g. Grocery Run, Monthly Rent, Client Retainer"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
              autoFocus
              required
            />
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Amount ({currencySymbol})
              </label>
              <input
                type="number"
                min="0.01"
                step="any"
                placeholder="45.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Category Dropdown (if not income) */}
          {type !== 'income' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Budget Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none bg-white"
              >
                {availableCategories.length > 0 ? (
                  availableCategories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} (Budget: {currencySymbol}{c.budgetLimit})
                    </option>
                  ))
                ) : (
                  categoryBudgets.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          )}

          {/* Footer buttons */}
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
              Save Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
