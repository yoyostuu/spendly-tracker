import React, { useState } from 'react';
import { X, Gift, Check, ArrowRight } from 'lucide-react';

export default function SavingsSection({ savings, onClose, onSave }) {
  const [goalName, setGoalName] = useState(savings?.goalName || '');
  const [goalAmount, setGoalAmount] = useState(savings?.goalAmount || '');
  const [currentAmount, setCurrentAmount] = useState(savings?.currentAmount || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedGoal = parseFloat(goalAmount);
    const parsedCurrent = parseFloat(currentAmount);

    onSave({
      goalName: goalName.trim() || '',
      goalAmount: isNaN(parsedGoal) || parsedGoal <= 0 ? null : parsedGoal,
      currentAmount: isNaN(parsedCurrent) || parsedCurrent < 0 ? 0 : parsedCurrent
    });
  };

  // Quick action to add money to savings
  const [quickAddAmount, setQuickAddAmount] = useState('');
  const handleQuickAdd = (e) => {
    e.preventDefault();
    const add = parseFloat(quickAddAmount);
    if (isNaN(add) || add <= 0) return;
    
    const nextCurrent = currentAmount + add;
    setCurrentAmount(nextCurrent);
    
    // Save state directly
    onSave({
      goalName: goalName.trim() || '',
      goalAmount: goalAmount ? parseFloat(goalAmount) : null,
      currentAmount: nextCurrent
    });
    setQuickAddAmount('');
  };

  const pct = goalAmount > 0 ? Math.min(100, Math.round((currentAmount / goalAmount) * 100)) : 0;

  const getMilestoneClassAndMessage = (percent) => {
    if (percent >= 100) return { text: 'Congratulations! 🎉', color: 'var(--accent-loans)' };
    if (percent >= 75) return { text: 'Almost there! 🎯', color: 'var(--accent-savings)' };
    if (percent >= 50) return { text: 'Halfway there! 🚀', color: 'var(--accent-travel)' };
    if (percent >= 25) return { text: 'Great start! 💪', color: 'var(--accent-food)' };
    return { text: 'Every bit counts! 🌱', color: 'var(--text-secondary)' };
  };

  const feedback = getMilestoneClassAndMessage(pct);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'Manrope' }}>
          <Gift size={20} style={{ color: 'var(--accent-savings)' }} />
          Savings Goal
        </h2>

        {/* Progress Display */}
        {goalAmount > 0 && (
          <div style={{ marginBottom: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {goalName || 'Savings'} progress
              </span>
              <span style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--accent-savings)' }}>
                {pct}%
              </span>
            </div>

            <div className="progress-bar-container" style={{ margin: '0.5rem 0' }}>
              <div 
                className="progress-bar" 
                style={{ 
                  width: `${pct}%`, 
                  backgroundColor: 'var(--accent-savings)' 
                }}
              ></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <span>₹{currentAmount.toLocaleString('en-IN')}</span>
              <span>of ₹{parseFloat(goalAmount).toLocaleString('en-IN')}</span>
            </div>

            <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', fontWeight: '600', color: feedback.color, textAlign: 'center' }}>
              {feedback.text}
            </div>

            {/* Quick add money directly */}
            <form onSubmit={handleQuickAdd} style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
              <input 
                type="number"
                placeholder="Add money (₹)..."
                className="input-field"
                style={{ flex: 1, padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                value={quickAddAmount}
                onChange={(e) => setQuickAddAmount(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                Add
              </button>
            </form>
          </div>
        )}

        {/* Goal Settings Form */}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">What are you saving for?</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="e.g. Laptop, Trip, emergency fund..." 
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Goal Target Amount (₹)</label>
            <input 
              type="number" 
              className="input-field" 
              placeholder="0 (leave empty for general savings)" 
              value={goalAmount}
              onChange={(e) => setGoalAmount(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Current Savings (₹)</label>
            <input 
              type="number" 
              className="input-field" 
              placeholder="0" 
              value={currentAmount}
              onChange={(e) => setCurrentAmount(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              Save Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
