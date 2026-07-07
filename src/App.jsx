import React, { useState, useEffect } from 'react';
import { Sparkles, LayoutDashboard, History, BarChart3, Settings as SettingsIcon, Sun, Moon, X } from 'lucide-react';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import QuickLogModal from './components/QuickLogModal';
import LoansSection from './components/LoansSection';
import SavingsSection from './components/SavingsSection';
import Timeline from './components/Timeline';
import Insights from './components/Insights';
import Settings from './components/Settings';
import Toast from './components/Toast';
import { api } from './utils/api';

const DEFAULT_DATA = {
  balance: 5000,
  foodBudget: null,
  travelBudget: null,
  transactions: [],
  loans: [],
  savings: { goalName: '', goalAmount: null, currentAmount: 0 },
  reminders: { enabled: false, time: '20:00', browserEnabled: false, emailEnabled: false }
};

export default function App() {
  const [onboarded, setOnboarded] = useState(() => {
    return localStorage.getItem('spendly_onboarded') === 'true';
  });

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('spendly_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error parsing user data:', e);
    }
    return null;
  });

  const [data, setData] = useState(() => {
    try {
      const savedData = localStorage.getItem('spendly_data');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed && typeof parsed === 'object') {
          return {
            ...DEFAULT_DATA,
            ...parsed
          };
        }
      }
    } catch (e) {
      console.error('Error parsing local storage data:', e);
    }
    return DEFAULT_DATA;
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [toastMessage, setToastMessage] = useState(null);

  // Modals States
  const [logCategory, setLogCategory] = useState(null);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [showLoansModal, setShowLoansModal] = useState(false);
  const [showSavingsModal, setShowSavingsModal] = useState(false);
  const [budgetCategory, setBudgetCategory] = useState(null);
  const [showAuthOverlay, setShowAuthOverlay] = useState(false);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('spendly_theme') || 'light';
  });

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    localStorage.setItem('spendly_theme', theme);
  }, [theme]);

  // Sync data whenever it changes and user is logged in
  useEffect(() => {
    localStorage.setItem('spendly_data', JSON.stringify(data));
    if (user?.email) {
      // Sync to backend silently
      api.sync(user.email, data).catch((err) => {
        console.error('Auto sync error:', err);
      });
    }
  }, [data, user]);

  const handleOnboardingComplete = (reminderSettings) => {
    setData(prev => ({
      ...prev,
      reminders: reminderSettings
    }));
    setOnboarded(true);
    localStorage.setItem('spendly_onboarded', 'true');
    showToast('Onboarding complete! 👋');
  };

  const handleSetUser = (userInfo) => {
    setUser(userInfo);
    localStorage.setItem('spendly_user', JSON.stringify(userInfo));
    
    // Auto-migrate Guest data to cloud if registration is fresh
    const serverData = userInfo.data;
    const hasLocalHistory = data.transactions.length > 0 || data.foodBudget || data.travelBudget || data.loans.length > 0 || data.savings.currentAmount > 0;
    const hasServerHistory = serverData && (serverData.transactions?.length > 0 || serverData.foodBudget || serverData.travelBudget || serverData.loans?.length > 0 || serverData.savings?.currentAmount > 0);

    if (hasLocalHistory && !hasServerHistory) {
      // Offline guest registering / logging into empty account -> Push local data to server
      api.sync(userInfo.email, data).then(() => {
        showToast('Guest offline data synced to cloud! ✓');
      }).catch(err => {
        console.error('Migration sync failed:', err);
        showToast('Sync completed with warnings.');
      });
    } else if (hasServerHistory) {
      // Existing server history -> restore cloud history
      setData({ ...DEFAULT_DATA, ...serverData });
      showToast('Restored your cloud data! ✓');
    } else {
      if (serverData) {
        setData({ ...DEFAULT_DATA, ...serverData });
      }
      showToast('Logged in & Synced! ✓');
    }
  };

  const showToast = (message) => {
    setToastMessage(message);
  };

  // Transaction Actions
  const handleSaveTransaction = (transactionPayload) => {
    const newTransaction = {
      id: Date.now(),
      category: transactionPayload.category,
      amount: transactionPayload.amount,
      note: transactionPayload.note,
      date: new Date().toISOString()
    };

    setData(prev => {
      // Adjust balance when transaction is logged
      const nextBalance = prev.balance - transactionPayload.amount;
      return {
        ...prev,
        balance: nextBalance,
        transactions: [newTransaction, ...prev.transactions]
      };
    });

    setLogCategory(null);
    showToast('Saved ✓');
  };

  const handleDeleteTransaction = (id) => {
    const target = data.transactions.find(t => t.id === id);
    if (!target) return;

    setData(prev => {
      // Refund balance
      const nextBalance = prev.balance + target.amount;
      const nextTransactions = prev.transactions.filter(t => t.id !== id);
      return {
        ...prev,
        balance: nextBalance,
        transactions: nextTransactions
      };
    });

    showToast('Removed log');
  };

  // Balance Actions
  const handleAdjustBalance = (newAmount) => {
    setData(prev => ({
      ...prev,
      balance: newAmount
    }));
    setShowBalanceModal(false);
    showToast('Balance updated ✓');
  };

  // Budget Actions
  const handleUpdateBudgets = (budgets) => {
    setData(prev => ({
      ...prev,
      ...budgets
    }));
    showToast('Budgets updated ✓');
  };

  // Reminder Actions
  const handleUpdateReminders = (remSettings) => {
    setData(prev => ({
      ...prev,
      reminders: remSettings
    }));
    showToast('Reminders updated ✓');
  };

  // Loans Actions
  const handleSaveLoan = (newLoan) => {
    setData(prev => {
      // Adjust available balance based on loan action
      // Borrowing money -> you receive cash (balance increases)
      // Lending money -> you give cash (balance decreases)
      const balanceChange = newLoan.type === 'Lent' ? -newLoan.amount : newLoan.amount;
      return {
        ...prev,
        balance: prev.balance + balanceChange,
        loans: [...prev.loans, newLoan]
      };
    });
    showToast('Loan added ✓');
  };

  const handleDeleteLoan = (loanId) => {
    const loan = data.loans.find(l => l.id === loanId);
    if (!loan) return;

    setData(prev => {
      // Revert initial loan balance adjustment if still pending
      let balanceChange = 0;
      if (loan.status === 'Pending') {
        // If pending, we undo the initial action
        balanceChange = loan.type === 'Lent' ? loan.amount : -loan.amount;
      }
      return {
        ...prev,
        balance: prev.balance + balanceChange,
        loans: prev.loans.filter(l => l.id !== loanId)
      };
    });
    showToast('Loan removed');
  };

  const handleToggleLoanStatus = (loanId) => {
    setData(prev => {
      const updatedLoans = prev.loans.map(loan => {
        if (loan.id === loanId) {
          const nextStatus = loan.status === 'Pending' ? 'Returned' : 'Pending';
          const totalRepayed = (loan.repayments || []).reduce((sum, r) => sum + r.amount, 0);
          const remainder = Math.max(0, loan.amount - totalRepayed);
          
          let settlementAmt = 0;
          if (nextStatus === 'Returned') {
            settlementAmt = loan.type === 'Lent' ? remainder : -remainder;
          } else {
            settlementAmt = loan.type === 'Lent' ? -remainder : remainder;
          }

          prev.balance += settlementAmt;

          return { ...loan, status: nextStatus };
        }
        return loan;
      });

      return {
        ...prev,
        loans: updatedLoans
      };
    });

    showToast('Status updated ✓');
  };

  const handleAddRepayment = (loanId, repaymentAmt) => {
    setData(prev => {
      const updatedLoans = prev.loans.map(loan => {
        if (loan.id === loanId) {
          const currentRepayments = loan.repayments || [];
          const newRepayment = {
            id: Date.now(),
            amount: repaymentAmt,
            date: new Date().toISOString()
          };
          const nextRepayments = [...currentRepayments, newRepayment];
          const totalRepayed = nextRepayments.reduce((sum, r) => sum + r.amount, 0);
          
          const nextStatus = totalRepayed >= loan.amount ? 'Returned' : 'Pending';
          const balanceChange = loan.type === 'Lent' ? repaymentAmt : -repaymentAmt;
          
          prev.balance += balanceChange;

          return {
            ...loan,
            repayments: nextRepayments,
            status: nextStatus
          };
        }
        return loan;
      });

      return {
        ...prev,
        loans: updatedLoans
      };
    });

    showToast('Repayment recorded ✓');
  };

  // Savings Actions
  const handleSaveSavings = (savingsPayload) => {
    setData(prev => {
      // Deduct/Reflect savings adjustment in available balance?
      // To keep it simple, savings goals have a separate balance, and available balance
      // decreases by the amount added to current savings. If user edited currentSavings directly:
      const difference = savingsPayload.currentAmount - prev.savings.currentAmount;
      return {
        ...prev,
        balance: prev.balance - difference,
        savings: savingsPayload
      };
    });
    setShowSavingsModal(false);
    showToast('Savings updated ✓');
  };

  // Sync Action
  const handleManualSync = async () => {
    if (!user?.email) return;
    const response = await api.sync(user.email, data);
    setData(response.data);
  };

  // Logout Action
  const handleLogout = () => {
    setUser(null);
    setOnboarded(false);
    setData(DEFAULT_DATA);
    localStorage.removeItem('spendly_user');
    localStorage.removeItem('spendly_onboarded');
    localStorage.removeItem('spendly_data');
    setActiveTab('dashboard');
    showToast('Logged out');
  };

  // Render correct panel
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            data={data}
            onOpenLogModal={(category) => setLogCategory(category)}
            onOpenSavingsModal={() => setShowSavingsModal(true)}
            onOpenLoansModal={() => setShowLoansModal(true)}
            onOpenBalanceModal={() => setShowBalanceModal(true)}
            onOpenBudgetModal={(category) => setBudgetCategory(category)}
          />
        );
      case 'timeline':
        return (
          <Timeline
            transactions={data.transactions}
            onDeleteTransaction={handleDeleteTransaction}
          />
        );
      case 'insights':
        return <Insights data={data} />;
      case 'settings':
        return (
          <Settings
            data={data}
            user={user}
            onUpdateBudgets={handleUpdateBudgets}
            onUpdateReminders={handleUpdateReminders}
            onSync={handleManualSync}
            onLogout={handleLogout}
            theme={theme}
            onChangeTheme={setTheme}
            onTriggerAuthModal={() => setShowAuthOverlay(true)}
          />
        );
      default:
        return null;
    }
  };

  if (!onboarded) {
    return (
      <div className="app-container">
        <Onboarding
          onComplete={handleOnboardingComplete}
          onSetUser={handleSetUser}
        />
        {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Premium Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <Sparkles size={20} style={{ color: 'var(--accent-savings)' }} />
          <span style={{ fontFamily: 'Manrope', fontWeight: '800', fontSize: '1.25rem', letterSpacing: '-0.02em' }}>Spendly</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button 
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--text-secondary)', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
              transition: 'var(--transition-smooth)'
            }}
            title={theme === 'light' ? 'Switch to Dark Theme' : 'Switch to Light Theme'}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', padding: '3px 9px', borderRadius: '12px' }}>
            {user ? 'Cloud Sync' : 'Guest'}
          </span>
        </div>
      </header>

      {/* Main Tab Screen */}
      <main style={{ flex: 1, paddingBottom: '7.5rem' }}>
        {renderTabContent()}
      </main>

      {/* Navigation Bar */}
      <nav className="nav-bar">
        <button 
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'timeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          <History size={20} />
          <span>Timeline</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'insights' ? 'active' : ''}`}
          onClick={() => setActiveTab('insights')}
        >
          <BarChart3 size={20} />
          <span>Insights</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <SettingsIcon size={20} />
          <span>Settings</span>
        </button>
      </nav>

      {/* Quick Logging Modals */}
      {logCategory && (
        <QuickLogModal
          category={logCategory}
          onClose={() => setLogCategory(null)}
          onSave={handleSaveTransaction}
        />
      )}

      {showBalanceModal && (
        <QuickLogModal
          mode="balance"
          currentBalance={data.balance}
          onClose={() => setShowBalanceModal(false)}
          onSave={handleAdjustBalance}
        />
      )}

      {showLoansModal && (
        <LoansSection
          loans={data.loans}
          onClose={() => setShowLoansModal(false)}
          onSaveLoan={handleSaveLoan}
          onDeleteLoan={handleDeleteLoan}
          onToggleStatus={handleToggleLoanStatus}
          onAddRepayment={handleAddRepayment}
        />
      )}

      {showSavingsModal && (
        <SavingsSection
          savings={data.savings}
          onClose={() => setShowSavingsModal(false)}
          onSave={handleSaveSavings}
        />
      )}

      {budgetCategory && (
        <QuickLogModal
          mode="budget"
          category={budgetCategory}
          currentLimit={budgetCategory === 'Food' ? data.foodBudget : data.travelBudget}
          onClose={() => setBudgetCategory(null)}
          onSave={(newLimit) => {
            handleUpdateBudgets({
              [`${budgetCategory.toLowerCase()}Budget`]: newLimit
            });
            setBudgetCategory(null);
          }}
        />
      )}

      {showAuthOverlay && (
        <div className="modal-overlay" onClick={() => setShowAuthOverlay(false)}>
          <div className="modal-content" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowAuthOverlay(false)}>
              <X size={20} />
            </button>
            <Onboarding
              initialStep={2}
              onComplete={(reminderSettings) => {
                setShowAuthOverlay(false);
                if (reminderSettings) {
                  setData(prev => ({ ...prev, reminders: reminderSettings }));
                }
              }}
              onSetUser={(userInfo) => {
                handleSetUser(userInfo);
                setShowAuthOverlay(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Dynamic Action Toast Confirmation */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
}
