import React, { useState } from 'react';
import { X, Plus, Landmark, Trash2, Calendar, Check, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function LoansSection({ loans = [], onClose, onSaveLoan, onDeleteLoan, onToggleStatus, onAddRepayment }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [person, setPerson] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('Lent'); // Lent or Borrowed
  const [dueDate, setDueDate] = useState('');
  const [reminder, setReminder] = useState(false);
  const [expandedLoanId, setExpandedLoanId] = useState(null);
  const [repayAmt, setRepayAmt] = useState('');
  const [repayDate, setRepayDate] = useState('');

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
                loans.map((loan) => {
                  const totalRepayed = (loan.repayments || []).reduce((sum, r) => sum + r.amount, 0);
                  const remaining = Math.max(0, loan.amount - totalRepayed);
                  const isExpanded = expandedLoanId === loan.id;

                  return (
                    <div 
                      key={loan.id} 
                      style={{ 
                        background: 'rgba(255, 255, 255, 0.02)', 
                        border: '1px solid var(--border-color)', 
                        borderRadius: '12px', 
                        padding: '0.75rem 1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        opacity: loan.status === 'Returned' ? 0.6 : 1,
                        transition: 'var(--transition-smooth)',
                        cursor: 'pointer'
                      }}
                      onClick={() => setExpandedLoanId(isExpanded ? null : loan.id)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
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
                            <span style={{ fontWeight: '600', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              {loan.person}
                              {isExpanded ? <ChevronUp size={14} style={{ color: 'var(--text-secondary)' }} /> : <ChevronDown size={14} style={{ color: 'var(--text-secondary)' }} />}
                            </span>
                          </div>
                          
                          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {loan.dueDate && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                <Calendar size={12} /> Due: {getLocalDateString(loan.dueDate)}
                              </span>
                            )}
                            {loan.status === 'Returned' && (
                              <span style={{ color: 'var(--accent-loans)', fontWeight: '500' }}>✓ Fully Repaid</span>
                            )}
                            {loan.status !== 'Returned' && !isExpanded && (
                              <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.7rem' }}>(click to log repayment)</span>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }} onClick={(e) => e.stopPropagation()}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ 
                              fontFamily: 'Manrope', 
                              fontWeight: '700', 
                              fontSize: '1rem',
                              color: loan.type === 'Lent' ? 'var(--accent-loans)' : 'var(--accent-danger)' 
                            }}>
                              {totalRepayed > 0 ? `₹${remaining}` : `₹${loan.amount}`}
                            </div>
                            {totalRepayed > 0 && (
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                of ₹{loan.amount}
                              </div>
                            )}
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

                      {isExpanded && (
                        <div 
                          onClick={(e) => e.stopPropagation()} 
                          style={{ 
                            marginTop: '0.75rem', 
                            paddingTop: '0.75rem', 
                            borderTop: '1px dashed var(--border-color)', 
                            width: '100%',
                            animation: 'fadeIn 0.2s ease-out' 
                          }}
                        >
                          <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                            Repayment Logs
                          </div>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.75rem' }}>
                            {(loan.repayments || []).length === 0 ? (
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                No partial repayments logged yet.
                              </div>
                            ) : (
                              (loan.repayments || []).map((rep) => (
                                <div key={rep.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '2px 0' }}>
                                  <span style={{ fontWeight: '500' }}>₹{rep.amount} repaid</span>
                                  <span style={{ color: 'var(--text-secondary)' }}>{getLocalDateString(rep.date)}</span>
                                </div>
                              ))
                            )}
                          </div>

                          {loan.status !== 'Returned' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem', width: '100%' }}>
                              <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                                <input 
                                  type="number" 
                                  className="input-field" 
                                  placeholder="Repay amount (₹)" 
                                  style={{ flex: 1, padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}
                                  value={repayAmt}
                                  onChange={(e) => setRepayAmt(e.target.value)}
                                />
                                <input 
                                  type="date" 
                                  className="input-field" 
                                  style={{ flex: 1, padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}
                                  value={repayDate}
                                  onChange={(e) => setRepayDate(e.target.value)}
                                />
                              </div>
                              <button 
                                type="button" 
                                className="btn btn-primary" 
                                style={{ width: '100%', padding: '0.45rem', fontSize: '0.85rem', minHeight: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                                onClick={() => {
                                  const amt = parseFloat(repayAmt);
                                  if (isNaN(amt) || amt <= 0 || amt > remaining) {
                                    alert(`Enter a valid amount up to ₹${remaining}`);
                                    return;
                                  }
                                  onAddRepayment(loan.id, amt, repayDate || null);
                                  setRepayAmt('');
                                  setRepayDate('');
                                }}
                              >
                                Record Repayment
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
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
