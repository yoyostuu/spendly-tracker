import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

export default function QuickLogModal({ category, onClose, onSave, mode = 'expense', currentBalance = 0, currentLimit = null }) {
  const [amount, setAmount] = useState(() => {
    if (mode === 'budget' && currentLimit !== null) {
      return currentLimit.toString();
    }
    return '';
  });
  const [note, setNote] = useState('');

  useEffect(() => {
    // Focus on the amount input automatically when modal opens
    setTimeout(() => {
      const input = document.getElementById('quick-log-amount');
      if (input) input.focus();
    }, 100);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'budget' && amount === '') {
      onSave(null);
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (mode === 'budget') {
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        onSave(null); // Clear budget if 0 or empty
      } else {
        onSave(parsedAmount);
      }
      return;
    }

    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    if (mode === 'balance') {
      onSave(parsedAmount);
    } else {
      onSave({
        category,
        amount: parsedAmount,
        note: note.trim()
      });
    }
  };

  const getAccentColor = () => {
    if (mode === 'balance') return 'var(--text-primary)';
    switch (category) {
      case 'Food': return 'var(--accent-food)';
      case 'Travel': return 'var(--accent-travel)';
      case 'Things Bought': return 'var(--accent-things)';
      default: return 'var(--text-primary)';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'Manrope' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: getAccentColor() }}></span>
          {mode === 'balance' ? 'Adjust Balance' : mode === 'budget' ? `Set ${category} Limit` : `Log ${category}`}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">
              {mode === 'balance' ? 'New Balance Amount' : mode === 'budget' ? 'Monthly Limit (₹)' : 'Amount (₹)'}
            </label>
            <input
              id="quick-log-amount"
              type="number"
              inputMode="decimal"
              className="input-field"
              placeholder={mode === 'balance' ? currentBalance.toString() : mode === 'budget' ? "Enter limit (clear to remove)" : "0"}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              style={{ fontSize: '1.5rem', fontWeight: '600', padding: '0.75rem 1rem' }}
            />
          </div>

          {mode !== 'balance' && mode !== 'budget' && (
            <div className="input-group">
              <label className="input-label">Optional Note</label>
              <input
                type="text"
                className="input-field"
                placeholder="What did you spend on?"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
