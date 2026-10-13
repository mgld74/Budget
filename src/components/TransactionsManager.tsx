import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Search,
  Filter,
  Download,
  Plus,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Tag,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { Transaction } from '../types/finance';
import { formatCurrency } from '../utils/calculations';

export const TransactionsManager: React.FC<{ onOpenNewTx: () => void }> = ({ onOpenNewTx }) => {
  const {
    transactions,
    deleteTransaction,
    currencySymbol,
    categoryBudgets,
  } = useFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  // Filtered and sorted transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        const matchesSearch =
          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === 'all' || t.type === typeFilter;
        const matchesCat = categoryFilter === 'all' || t.category === categoryFilter;
        return matchesSearch && matchesType && matchesCat;
      })
      .sort((a, b) => {
        if (sortOrder === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (sortOrder === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (sortOrder === 'highest') return b.amount - a.amount;
        if (sortOrder === 'lowest') return a.amount - b.amount;
        return 0;
      });
  }, [transactions, searchQuery, typeFilter, categoryFilter, sortOrder]);

  // Aggregate stats for filtered set
  const totalFilteredIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalFilteredExpense = filteredTransactions
    .filter((t) => t.type !== 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Date', 'Description', 'Type', 'Category', 'Amount'];
    const rows = filteredTransactions.map((t) => [
      t.date,
      `"${t.description.replace(/"/g, '""')}"`,
      t.type,
      `"${t.category.replace(/"/g, '""')}"`,
      t.amount,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const uniqueCategories = Array.from(new Set(transactions.map((t) => t.category)));

  return (
    <div className="space-y-6 pb-12">
      
      {/* 1. Header & Summary */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Cash Flow & Transactions Ledger</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review and categorize incoming deposits and outflows against your 50/30/20 budget envelope.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              title="Download CSV report"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onOpenNewTx}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Transaction</span>
            </button>
          </div>
        </div>

        {/* Filter Summary Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-500 font-medium">Filtered Inflow</span>
            <div className="text-lg font-bold font-mono text-emerald-700 mt-0.5">
              +{formatCurrency(totalFilteredIncome, currencySymbol)}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-500 font-medium">Filtered Outflow</span>
            <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
              -{formatCurrency(totalFilteredExpense, currencySymbol)}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-500 font-medium">Net View Cash Flow</span>
            <div
              className={`text-lg font-bold font-mono mt-0.5 ${
                totalFilteredIncome >= totalFilteredExpense ? 'text-emerald-700' : 'text-rose-600'
              }`}
            >
              {formatCurrency(totalFilteredIncome - totalFilteredExpense, currencySymbol)}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Filters & Search Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search description or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
            >
              <option value="all">All Types</option>
              <option value="income">Income Only</option>
              <option value="needs">Needs (Essential)</option>
              <option value="wants">Wants (Discretionary)</option>
              <option value="savings">Savings / Investment</option>
              <option value="debt">Debt Paydown</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
            >
              <option value="all">All Categories</option>
              {uniqueCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="highest">Sort: Highest Amount</option>
              <option value="lowest">Sort: Lowest Amount</option>
            </select>
          </div>

        </div>
      </div>

      {/* 3. Transactions Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-900">No transactions found</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
              Try adjusting your search query or filters, or record a new transaction.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Pillar / Type</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((tx) => {
                  const isIncome = tx.type === 'income';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                        {tx.date}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {tx.description}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`capitalize font-medium text-[11px] ${
                            isIncome
                              ? 'text-emerald-700'
                              : tx.type === 'needs'
                              ? 'text-blue-700'
                              : tx.type === 'wants'
                              ? 'text-amber-700'
                              : tx.type === 'savings'
                              ? 'text-teal-700'
                              : 'text-rose-700'
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {tx.category}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold whitespace-nowrap">
                        <span className={isIncome ? 'text-emerald-600' : 'text-slate-900'}>
                          {isIncome ? '+' : '-'}
                          {formatCurrency(tx.amount, currencySymbol)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => deleteTransaction(tx.id)}
                          className="p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
