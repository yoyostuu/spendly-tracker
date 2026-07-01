import React from 'react';
import { Calendar, Trash2, Utensils, Car, ShoppingBag, Landmark, ArrowRight, ArrowLeft } from 'lucide-react';

export default function Timeline({ transactions = [], onDeleteTransaction }) {
  
  // Helper to format ISO string into date category
  const getRelativeDateString = (dateIsoStr) => {
    const date = new Date(dateIsoStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
  };

  // Group transactions by date
  const groupedTransactions = transactions.reduce((groups, t) => {
    const key = getRelativeDateString(t.date);
    if (!groups[key]) groups[key] = [];
    groups[key].push(t);
    return groups;
  }, {});

  // Sort dates so newer is first
  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => {
    // Treat 'Today' and 'Yesterday' explicitly or sort by parsing the date of the first item
    const getGroupDate = (groupName) => {
      const firstItem = groupedTransactions[groupName][0];
      return new Date(firstItem.date).getTime();
    };
    return getGroupDate(b) - getGroupDate(a);
  });

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Food':
        return <Utensils size={16} style={{ color: 'var(--accent-food)' }} />;
      case 'Travel':
        return <Car size={16} style={{ color: 'var(--accent-travel)' }} />;
      case 'Things Bought':
        return <ShoppingBag size={16} style={{ color: 'var(--accent-things)' }} />;
      default:
        return <Calendar size={16} />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Food': return 'var(--accent-food)';
      case 'Travel': return 'var(--accent-travel)';
      case 'Things Bought': return 'var(--accent-things)';
      default: return 'var(--text-primary)';
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem', fontFamily: 'Manrope' }}>
        Activity Timeline
      </h2>

      {sortedDates.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-secondary)' }}>
          <Calendar size={32} style={{ margin: '0 auto 1rem auto', opacity: 0.3 }} />
          <p style={{ fontSize: '0.9rem' }}>No logged transactions yet.</p>
          <p style={{ fontSize: '0.75rem', marginTop: '4px', opacity: 0.7 }}>Tap a dashboard card to log something in 2 seconds.</p>
        </div>
      ) : (
        sortedDates.map((dateStr) => (
          <div key={dateStr} className="timeline-date-group">
            <h3 className="timeline-date-header">{dateStr}</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {groupedTransactions[dateStr]
                // Sort transactions within the day descending by time
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((t) => (
                  <div key={t.id} className="timeline-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '8px', 
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--border-color)'
                      }}>
                        {getCategoryIcon(t.category)}
                      </div>
                      
                      <div className="timeline-item-meta">
                        <span className="timeline-item-title">{t.category}</span>
                        {t.note && <span className="timeline-item-note">{t.note}</span>}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span className="timeline-item-amount" style={{ color: getCategoryColor(t.category) }}>
                        - ₹{t.amount}
                      </span>
                      
                      <button 
                        className="btn-icon" 
                        style={{ width: '26px', height: '26px', color: 'var(--accent-danger)' }}
                        onClick={() => onDeleteTransaction(t.id)}
                        title="Delete log"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
