import React, { useEffect } from 'react';
import { Check } from 'lucide-react';

export default function Toast({ message = 'Saved ✓', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="toast-container">
      <div className="toast">
        <Check size={16} />
        <span>{message}</span>
      </div>
    </div>
  );
}
