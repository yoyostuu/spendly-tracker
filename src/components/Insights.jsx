import React from 'react';
import { TrendingUp, AlertTriangle, CheckCircle, BarChart3 } from 'lucide-react';

export default function Insights({ data }) {
  const {
    foodBudget = null,
    travelBudget = null,
    transactions = [],
    loans = [],
    savings = { goalName: '', goalAmount: null, currentAmount: 0 }
  } = data;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Aggregate current month transactions
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
  const totalSpent = foodSpent + travelSpent + thingsSpent;

  // Average daily food spending
  const currentDay = now.getDate();
  const avgDailyFood = currentDay > 0 ? (foodSpent / currentDay).toFixed(0) : 0;

  // Budget statuses
  const foodOver = foodBudget && foodSpent > foodBudget;
  const travelOver = travelBudget && travelSpent > travelBudget;
  const isOverspending = foodOver || travelOver;

  // Loans total
  const totalLent = loans
    .filter((l) => l.type === 'Lent' && l.status === 'Pending')
    .reduce((sum, l) => sum + l.amount, 0);
  const totalBorrowed = loans
    .filter((l) => l.type === 'Borrowed' && l.status === 'Pending')
    .reduce((sum, l) => sum + l.amount, 0);

  // SVG Donut Ring Calculations
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  
  const getPercent = (amount) => (totalSpent > 0 ? (amount / totalSpent) * 100 : 0);
  const foodPct = getPercent(foodSpent);
  const travelPct = getPercent(travelSpent);
  const thingsPct = getPercent(thingsSpent);

  // Calculate stroke dashes for donut segments
  const foodDash = (foodPct / 100) * circumference;
  const travelDash = (travelPct / 100) * circumference;
  const thingsDash = (thingsPct / 100) * circumference;

  return (
    <div style={{ animation: 'fadeIn 0.2s ease-out', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem', fontFamily: 'Manrope' }}>
        Monthly Insights
      </h2>

      {totalSpent === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
          <BarChart3 size={32} style={{ margin: '0 auto 1rem auto', opacity: 0.3 }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No data to generate insights yet.</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '4px', opacity: 0.7 }}>
            Log a few expenses to see your spending distribution.
          </p>
        </div>
      ) : (
        <>
          {/* Spending Distribution SVG Circle Ring Chart */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)', width: '100%', textAlign: 'left' }}>
              Spending Breakdown
            </h3>

            <div style={{ position: 'relative', width: '150px', height: '150px' }}>
              <svg width="150" height="150" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                {/* Background Ring */}
                <circle cx="60" cy="60" r={radius} fill="transparent" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="10" />
                
                {/* Food segment */}
                {foodSpent > 0 && (
                  <circle 
                    cx="60" 
                    cy="60" 
                    r={radius} 
                    fill="transparent" 
                    stroke="var(--accent-food)" 
                    strokeWidth="10" 
                    strokeDasharray={`${foodDash} ${circumference}`} 
                    strokeDashoffset={0}
                  />
                )}

                {/* Travel segment */}
                {travelSpent > 0 && (
                  <circle 
                    cx="60" 
                    cy="60" 
                    r={radius} 
                    fill="transparent" 
                    stroke="var(--accent-travel)" 
                    strokeWidth="10" 
                    strokeDasharray={`${travelDash} ${circumference}`} 
                    strokeDashoffset={-foodDash}
                  />
                )}

                {/* Things Bought segment */}
                {thingsSpent > 0 && (
                  <circle 
                    cx="60" 
                    cy="60" 
                    r={radius} 
                    fill="transparent" 
                    stroke="var(--accent-things)" 
                    strokeWidth="10" 
                    strokeDasharray={`${thingsDash} ${circumference}`} 
                    strokeDashoffset={-(foodDash + travelDash)}
                  />
                )}
              </svg>
              <div style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontFamily: 'Manrope' 
              }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Spent</span>
                <span style={{ fontSize: '1.25rem', fontWeight: '800' }}>₹{totalSpent}</span>
              </div>
            </div>

            {/* Custom Horizontal Bar Charts */}
            <div className="graph-container" style={{ width: '100%' }}>
              {/* Food */}
              <div className="graph-bar-row">
                <span className="graph-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-food)' }}></span>
                  Food
                </span>
                <div className="graph-bar-wrapper">
                  <div className="graph-bar-fill" style={{ width: `${foodPct}%`, background: 'var(--accent-food)' }}></div>
                  <span className="graph-bar-value">₹{foodSpent} ({foodPct.toFixed(0)}%)</span>
                </div>
              </div>

              {/* Travel */}
              <div className="graph-bar-row">
                <span className="graph-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-travel)' }}></span>
                  Travel
                </span>
                <div className="graph-bar-wrapper">
                  <div className="graph-bar-fill" style={{ width: `${travelPct}%`, background: 'var(--accent-travel)' }}></div>
                  <span className="graph-bar-value">₹{travelSpent} ({travelPct.toFixed(0)}%)</span>
                </div>
              </div>

              {/* Things Bought */}
              <div className="graph-bar-row">
                <span className="graph-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-things)' }}></span>
                  Bought
                </span>
                <div className="graph-bar-wrapper">
                  <div className="graph-bar-fill" style={{ width: `${thingsPct}%`, background: 'var(--accent-things)' }}></div>
                  <span className="graph-bar-value">₹{thingsSpent} ({thingsPct.toFixed(0)}%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            
            {/* Daily Food Spent */}
            <div className="card" style={{ cursor: 'default' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: '4px' }}>
                Daily Food Avg
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'Manrope', color: 'var(--accent-food)' }}>
                ₹{avgDailyFood}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                calculated over {currentDay} days
              </div>
            </div>

            {/* Budget Status */}
            <div className="card" style={{ cursor: 'default' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: '4px' }}>
                Budget Status
              </div>
              <div style={{ 
                fontSize: '1.1rem', 
                fontWeight: '700', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px',
                color: isOverspending ? 'var(--accent-danger)' : 'var(--accent-loans)',
                marginTop: '6px'
              }}>
                {isOverspending ? (
                  <>
                    <AlertTriangle size={16} /> Over limit
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} /> On Track
                  </>
                )}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                {isOverspending ? 'Reduce daily spending' : 'Keep up the good work!'}
              </div>
            </div>
            
          </div>

          {/* Loans & Savings Summary */}
          <div className="card" style={{ cursor: 'default' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              Financial Goals & Loans
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
              {/* Savings Goal Info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Savings Goal Progress</span>
                <span style={{ fontWeight: '600', color: 'var(--accent-savings)' }}>
                  {savings?.goalAmount > 0 
                    ? `₹${savings.currentAmount} / ₹${savings.goalAmount} (${Math.round((savings.currentAmount / savings.goalAmount) * 100)}%)` 
                    : `₹${savings?.currentAmount || 0} saved`}
                </span>
              </div>

              <div style={{ height: '1px', background: 'var(--border-color)' }}></div>

              {/* Outstanding loan summary */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Active Loans (Lent)</span>
                <span style={{ fontWeight: '600', color: 'var(--accent-loans)' }}>₹{totalLent}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Active Debts (Borrowed)</span>
                <span style={{ fontWeight: '600', color: 'var(--accent-danger)' }}>₹{totalBorrowed}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
