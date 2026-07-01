import React, { useState } from 'react';
import { X, Plus, Landmark, Trash2, Calendar, Check, AlertCircle } from 'lucide-react';

export default function LoansSection({ loans = [], onClose, onSaveLoan, onDeleteLoan, onToggleStatus }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [person, setPerson] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('Lent'); // Lent or Borrowed
  const [dueDate, setDueDate] = useState('');
  const [reminder, setReminder] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!person.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

    onSaveLoan({
      id: Date.now(),
      person: person.trim(),
      amount: parsedAmount,
      type,
      dueDate: dueDate || null,
      reminder,
      status: 'Pending',
      date: new Date().toISOString()
    });

    // Reset form
    setPerson('');
    setAmount('');
    setType('Lent');
    setDueDate('');
    setReminder(false);
    setShowAddForm(false);
  };

  const getLocalDateString = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'Manrope' }}>
          <Landmark size={20} style={{ color: 'var(--accent-loans)' }} />
          Loans & Debts
        </h2>

        {!showAddForm ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* List of loans */}
            <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '4px' }}>
              {loans.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  No active loans or debts.
                </div>
              ) : (
                loans.map((loan) => (
                  <div 
                    key={loan.id} 
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.02)', 
                      border: '1px solid var(--border-color)', 
                      borderRadius: '12px', 
                      padding: '0.75rem 1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      opacity: loan.status === 'Returned' ? 0.6 : 1,
                      transition: 'var(--transition-smooth)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span style={{ 
                          fontSize: '0.7rem', 
                          fontWeight: '600', 
                          padding: '2px 6px', 
                          borderRadius: '4px',
                          background: loan.type === 'Lent' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: loan.type === 'Lent' ? 'var(--accent-loans)' : 'var(--accent-danger)'
                        }}>
                          {loan.type === 'Lent' ? 'Lent' : 'Borrowed'}
                        </span>
                        <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{loan.person}</span>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {loan.dueDate && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <Calendar size={12} /> Due: {getLocalDateString(loan.dueDate)}
                          </span>
                        )}
                        {loan.status === 'Returned' && (
                          <span style={{ color: 'var(--accent-loans)', fontWeight: '500' }}>✓ Settled</span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ 
                          fontFamily: 'Manrope', 
                          fontWeight: '700', 
                          fontSize: '1rem',
                          color: loan.type === 'Lent' ? 'var(--accent-loans)' : 'var(--accent-danger)' 
                        }}>
                          ₹{loan.amount}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button 
                          className="btn-icon" 
                          style={{ 
                            width: '26px', 
                            height: '26px', 
                            borderColor: loan.status === 'Returned' ? 'var(--accent-loans)' : 'var(--border-color)',
                            backgroundColor: loan.status === 'Returned' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                            color: loan.status === 'Returned' ? 'var(--accent-loans)' : 'var(--text-secondary)'
                          }}
                          onClick={() => onToggleStatus(loan.id)}
                          title={loan.status === 'Returned' ? "Mark as Pending" : "Mark as Settled"}
                        >
                          <Check size={12} />
                        </button>
                        <button 
                          className="btn-icon" 
                          style={{ width: '26px', height: '26px', color: 'var(--accent-danger)' }}
                          onClick={() => onDeleteLoan(loan.id)}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '0.5rem' }} 
              onClick={() => setShowAddForm(true)}
            >
              <Plus size={16} /> Add Loan / Debt
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ animation: 'fadeIn 0.2s ease-out' }}>
            <div className="input-group">
              <label className="input-label">Person's Name</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. John Doe"
                value={person}
                onChange={(e) => setPerson(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Amount (₹)</label>
              <input 
                type="number" 
                className="input-field" 
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Type</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  type="button" 
                  className="btn" 
                  style={{ 
                    flex: 1, 
                    border: '1px solid',
                    borderColor: type === 'Lent' ? 'var(--accent-loans)' : 'var(--border-color)',
                    background: type === 'Lent' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                    color: type === 'Lent' ? 'var(--accent-loans)' : 'var(--text-secondary)'
                  }}
                  onClick={() => setType('Lent')}
                >
                  Money Lent
                </button>
                <button 
                  type="button" 
                  className="btn" 
                  style={{ 
                    flex: 1, 
                    border: '1px solid',
                    borderColor: type === 'Borrowed' ? 'var(--accent-danger)' : 'var(--border-color)',
                    background: type === 'Borrowed' ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                    color: type === 'Borrowed' ? 'var(--accent-danger)' : 'var(--text-secondary)'
                  }}
                  onClick={() => setType('Borrowed')}
                >
                  Money Borrowed
                </button>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Due Date (Optional)</label>
              <input 
                type="date" 
                className="input-field" 
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="switch-container">
              <div>
                <div style={{ fontWeight: '500', fontSize: '0.85rem' }}>Enable Reminder</div>
                <div className="switch-label-desc">Remind about this loan later</div>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={reminder} 
                  onChange={(e) => setReminder(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ flex: 1 }} 
                onClick={() => setShowAddForm(false)}
              >
                Back
              </button>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                Save Loan
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
