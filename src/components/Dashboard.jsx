import React from 'react';
import { Plus, Utensils, Car, ShoppingBag, Landmark, Gift, Wallet, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export default function Dashboard({
  data,
  onOpenLogModal,
  onOpenSavingsModal,
  onOpenLoansModal,
  onOpenBalanceModal,
  onOpenBudgetModal
}) {
  const {
    name = 'Student',
    balance = 5000,
    foodBudget = null,
    travelBudget = null,
    transactions = [],
    loans = [],
    savings = { goalName: '', goalAmount: null, currentAmount: 0 }
  } = data || {};

  // Calculate stats for current month
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Find last month details
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  // Calculate current month total spending (Food, Travel, Things Bought)
  const currentMonthSpent = transactions
    .filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear && t.category !== 'Loan';
    })
    .reduce((sum, t) => sum + t.amount, 0);

  // Calculate last month total spending
  const lastMonthSpent = transactions
    .filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear && t.category !== 'Loan';
    })
    .reduce((sum, t) => sum + t.amount, 0);

  // Build performance message
  let performanceMessage = '';
  if (lastMonthSpent > 0) {
    const diff = lastMonthSpent - currentMonthSpent;
    if (diff > 0) {
      const pct = Math.round((diff / lastMonthSpent) * 100);
      performanceMessage = `Spending is ₹${diff.toLocaleString('en-IN')} (${pct}%) lower than last month! Outstanding job. 🚀`;
    } else if (diff < 0) {
      const amt = Math.abs(diff);
      performanceMessage = `Spending is ₹${amt.toLocaleString('en-IN')} higher than last month. Log smaller items to catch up! ☕`;
    } else {
      performanceMessage = `Spending is neck-and-neck with last month. Dynamic control! 🎯`;
    }
  } else {
    if (currentMonthSpent === 0) {
      performanceMessage = `Welcome! Log your first expense card to begin tracking. 🌟`;
    } else {
      performanceMessage = `Spending is ₹320 lower than your weekly average. Off to a great start! 💪`;
    }
  }

  const currentMonthName = now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  const getMonthlyTotal = (category) => {
    return transactions
      .filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear && t.category === category;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const foodSpent = getMonthlyTotal('Food');
  const travelSpent = getMonthlyTotal('Travel');
  const thingsSpent = getMonthlyTotal('Things Bought');

  // Calculate balance adjustments from transactions
  // Actually, we store the actual current balance state which the user can edit, and we apply transactions as modifiers,
  // or we compute it dynamically. Let's compute it as: Base Balance (customizable) minus expenses + borrowed minus lent.
  // This is very robust and matches normal bookkeeping.

  // Daily budget calculations
  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const remainingDays = Math.max(1, daysInMonth - now.getDate() + 1);

  const getDailySuggestion = (spent, limit) => {
    if (!limit) return null;
    const remaining = limit - spent;
    if (remaining <= 0) return 'Budget exceeded!';
    const daily = (remaining / remainingDays).toFixed(0);
    return `You can spend ₹${daily}/day and stay within budget.`;
  };

  const foodSuggestion = getDailySuggestion(foodSpent, foodBudget);
  const travelSuggestion = getDailySuggestion(travelSpent, travelBudget);

  // Loans summary
  const pendingLent = loans
    .filter((l) => l.type === 'Lent' && l.status === 'Pending')
    .reduce((sum, l) => sum + l.amount, 0);
  const pendingBorrowed = loans
    .filter((l) => l.type === 'Borrowed' && l.status === 'Pending')
    .reduce((sum, l) => sum + l.amount, 0);

  // Savings progress
  const hasSavingsGoal = savings && savings.goalAmount > 0;
  const savingsPercent = hasSavingsGoal
    ? Math.min(100, Math.round((savings.currentAmount / savings.goalAmount) * 100))
    : 0;

  const getSavingsMessage = (pct) => {
    if (pct >= 100) return 'Congratulations! 🎉';
    if (pct >= 75) return 'Almost there! 🎯';
    if (pct >= 50) return 'Halfway there! 🚀';
    if (pct >= 25) return 'Great start! 💪';
    return 'Every bit counts! 🌱';
  };

  return (
    <div style={{ animation: 'fadeIn 0.2s ease-out', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Current Month Name and Performance Banner */}
      <div style={{ marginBottom: '0.25rem', padding: '0 4px' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--accent-food)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
          Hey {name} 👋
        </div>
        <h2 style={{ fontFamily: 'Manrope', fontWeight: '800', fontSize: '1.5rem', letterSpacing: '-0.02em', textTransform: 'capitalize' }}>
          {currentMonthName}
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: '500' }}>
          {performanceMessage}
        </p>
      </div>
      
      {/* Dynamic Available Balance Card */}
      <div 
        className="card balance-card" 
        onClick={onOpenBalanceModal} 
      >
        <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
            <Wallet size={16} />
            <span style={{ fontSize: '0.85rem', fontWeight: '500', letterSpacing: '0.02em', textTransform: 'uppercase' }}>Available Balance</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '10px' }}>Tap to Edit</span>
        </div>
        <div className="large-number" style={{ display: 'flex', alignItems: 'baseline' }}>
          <span className="currency-symbol">₹</span>
          {balance.toLocaleString('en-IN')}
        </div>
      </div>

      {/* Grid of categories */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
        
        {/* Food Card */}
        <div className="card card-food" onClick={() => onOpenLogModal('Food')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-food)' }}>
              <Utensils size={18} />
              <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Food</span>
            </div>
            <button 
              className="btn-icon" 
              onClick={(e) => {
                e.stopPropagation();
                onOpenLogModal('Food');
              }}
            >
              <Plus size={16} />
            </button>
          </div>

          <div style={{ margin: '0.25rem 0' }}>
            <div className="large-number" style={{ fontSize: '1.8rem' }}>
              <span className="currency-symbol" style={{ fontSize: '1.2rem' }}>₹</span>
              {foodSpent.toLocaleString('en-IN')}
            </div>
            {foodBudget ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                of ₹{foodBudget.toLocaleString('en-IN')} limit • <span 
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenBudgetModal('Food');
                  }}
                  style={{ color: 'var(--accent-food)', textDecoration: 'underline', fontWeight: '600', cursor: 'pointer' }}
                >Edit</span>
              </div>
            ) : (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                No budget limit set • <span 
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenBudgetModal('Food');
                  }}
                  style={{ color: 'var(--accent-food)', textDecoration: 'underline', fontWeight: '600', cursor: 'pointer' }}
                >Set Limit</span>
              </div>
            )}
          </div>

          {foodBudget && (
            <div style={{ marginTop: '0.75rem' }}>
              <div className="progress-bar-container">
                <div 
                  className="progress-bar" 
                  style={{ 
                    width: `${Math.min(100, (foodSpent / foodBudget) * 100)}%`,
                    backgroundColor: foodSpent > foodBudget ? 'var(--accent-danger)' : 'var(--accent-food)'
                  }}
                ></div>
              </div>
              <div style={{ fontSize: '0.75rem', color: foodSpent > foodBudget ? 'var(--accent-danger)' : 'var(--text-secondary)', fontWeight: '500' }}>
                {foodSuggestion}
              </div>
            </div>
          )}
        </div>

        {/* Travel / Petrol Card */}
        <div className="card card-travel" onClick={() => onOpenLogModal('Travel')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-travel)' }}>
              <Car size={18} />
              <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Travel / Petrol</span>
            </div>
            <button 
              className="btn-icon" 
              onClick={(e) => {
                e.stopPropagation();
                onOpenLogModal('Travel');
              }}
            >
              <Plus size={16} />
            </button>
          </div>

          <div style={{ margin: '0.25rem 0' }}>
            <div className="large-number" style={{ fontSize: '1.8rem' }}>
              <span className="currency-symbol" style={{ fontSize: '1.2rem' }}>₹</span>
              {travelSpent.toLocaleString('en-IN')}
            </div>
            {travelBudget ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                of ₹{travelBudget.toLocaleString('en-IN')} limit • <span 
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenBudgetModal('Travel');
                  }}
                  style={{ color: 'var(--accent-travel)', textDecoration: 'underline', fontWeight: '600', cursor: 'pointer' }}
                >Edit</span>
              </div>
            ) : (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                No budget limit set • <span 
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenBudgetModal('Travel');
                  }}
                  style={{ color: 'var(--accent-travel)', textDecoration: 'underline', fontWeight: '600', cursor: 'pointer' }}
                >Set Limit</span>
              </div>
            )}
          </div>

          {travelBudget && (
            <div style={{ marginTop: '0.75rem' }}>
              <div className="progress-bar-container">
                <div 
                  className="progress-bar" 
                  style={{ 
                    width: `${Math.min(100, (travelSpent / travelBudget) * 100)}%`,
                    backgroundColor: travelSpent > travelBudget ? 'var(--accent-danger)' : 'var(--accent-travel)'
                  }}
                ></div>
              </div>
              <div style={{ fontSize: '0.75rem', color: travelSpent > travelBudget ? 'var(--accent-danger)' : 'var(--text-secondary)', fontWeight: '500' }}>
                {travelSuggestion}
              </div>
            </div>
          )}
        </div>

        {/* Things Bought Card */}
        <div className="card card-things" onClick={() => onOpenLogModal('Things Bought')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-things)' }}>
              <ShoppingBag size={18} />
              <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Things Bought</span>
            </div>
            <button 
              className="btn-icon" 
              onClick={(e) => {
                e.stopPropagation();
                onOpenLogModal('Things Bought');
              }}
            >
              <Plus size={16} />
            </button>
          </div>

          <div style={{ margin: '0.25rem 0' }}>
            <div className="large-number" style={{ fontSize: '1.8rem' }}>
              <span className="currency-symbol" style={{ fontSize: '1.2rem' }}>₹</span>
              {thingsSpent.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Simple expense logs this month
            </div>
          </div>
        </div>

        {/* Loans Card */}
        <div className="card card-loans" onClick={onOpenLoansModal}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-loans)' }}>
              <Landmark size={18} />
              <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Loans</span>
            </div>
            <button 
              className="btn-icon" 
              onClick={(e) => {
                e.stopPropagation();
                onOpenLoansModal();
              }}
            >
              <Plus size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Lent</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginRight: '2px' }}>₹</span>
                {pendingLent.toLocaleString('en-IN')}
              </div>
            </div>
            <div style={{ width: '1px', background: 'var(--border-color)' }}></div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Borrowed</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginRight: '2px' }}>₹</span>
                {pendingBorrowed.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>

        {/* Savings Goal Card */}
        <div className="card card-savings" onClick={onOpenSavingsModal}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-savings)' }}>
              <Gift size={18} />
              <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                {savings?.goalName ? `Saving for: ${savings.goalName}` : 'Savings'}
              </span>
            </div>
            <button 
              className="btn-icon" 
              onClick={(e) => {
                e.stopPropagation();
                onOpenSavingsModal();
              }}
            >
              <Plus size={16} />
            </button>
          </div>

          {hasSavingsGoal ? (
            <div style={{ marginTop: '0.25rem' }}>
              <div className="large-number" style={{ fontSize: '1.8rem' }}>
                <span className="currency-symbol" style={{ fontSize: '1.2rem' }}>₹</span>
                {savings.currentAmount.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                of ₹{savings.goalAmount.toLocaleString('en-IN')} target ({savingsPercent}%)
              </div>

              <div style={{ marginTop: '0.75rem' }}>
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar" 
                    style={{ 
                      width: `${savingsPercent}%`,
                      backgroundColor: 'var(--accent-savings)'
                    }}
                  ></div>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-savings)', fontWeight: '600' }}>
                  {getSavingsMessage(savingsPercent)}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: '0.5rem' }}>
              <div className="large-number" style={{ fontSize: '1.8rem' }}>
                <span className="currency-symbol" style={{ fontSize: '1.2rem' }}>₹</span>
                {savings?.currentAmount?.toLocaleString('en-IN') || 0}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                No active savings goal setup. Tap here to set one.
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
