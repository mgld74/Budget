/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { BudgetPlanner } from './components/BudgetPlanner';
import { DebtPayoff } from './components/DebtPayoff';
import { GoalsTracker } from './components/GoalsTracker';
import { WealthSimulator } from './components/WealthSimulator';
import { TransactionsManager } from './components/TransactionsManager';
import { AIAssistantModal } from './components/AIAssistantModal';
import { NewTransactionModal } from './components/NewTransactionModal';
import { EditProfileModal } from './components/EditProfileModal';

function AppContent() {
  const { activeTab } = useFinance();
  const [isNewTxOpen, setIsNewTxOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navigation & Controls */}
      <Header
        onOpenNewTx={() => setIsNewTxOpen(true)}
        onOpenEditProfile={() => setIsEditProfileOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            onOpenNewTx={() => setIsNewTxOpen(true)}
            onOpenEditProfile={() => setIsEditProfileOpen(true)}
          />
        )}
        {activeTab === 'budget' && <BudgetPlanner />}
        {activeTab === 'debts' && <DebtPayoff />}
        {activeTab === 'goals' && <GoalsTracker />}
        {activeTab === 'simulator' && <WealthSimulator />}
        {activeTab === 'transactions' && (
          <TransactionsManager onOpenNewTx={() => setIsNewTxOpen(true)} />
        )}
      </main>

      {/* Global Modals */}
      <NewTransactionModal
        isOpen={isNewTxOpen}
        onClose={() => setIsNewTxOpen(false)}
      />
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
      />
      <AIAssistantModal />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Smart Money Planner</span>
            <span aria-hidden="true">·</span>
            <span>Client-side secure encrypted local storage</span>
          </div>
          <div>
            Built with 50/30/20 envelope budgeting & debt payoff engines
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  );
}
