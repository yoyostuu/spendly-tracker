import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, Mail, Compass, Coffee, Shield, Check, RefreshCw, LogOut, Moon } from 'lucide-react';
import { api } from '../utils/api';

export default function Settings({
  data,
  user,
  onUpdateBudgets,
  onUpdateReminders,
  onSync,
  onLogout,
  theme = 'dark',
  onChangeTheme,
  onTriggerAuthModal
}) {
  const {
    foodBudget = '',
    travelBudget = '',
    reminders = { enabled: false, time: '20:00', browserEnabled: false, emailEnabled: false }
  } = data || {};

  const safeReminders = reminders || { enabled: false, time: '20:00', browserEnabled: false, emailEnabled: false };

  const [food, setFood] = useState(foodBudget || '');
  const [travel, setTravel] = useState(travelBudget || '');
  const [remTime, setRemTime] = useState(safeReminders.time || '20:00');
  const [remEnabled, setRemEnabled] = useState(safeReminders.enabled || false);
  const [emailRem, setEmailRem] = useState(safeReminders.emailEnabled || false);
  const [browserRem, setBrowserRem] = useState(safeReminders.browserEnabled || false);

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    
    // Save budgets
    onUpdateBudgets({
      foodBudget: food === '' ? null : parseFloat(food),
      travelBudget: travel === '' ? null : parseFloat(travel)
    });

    // Save reminders
    onUpdateReminders({
      enabled: remEnabled,
      time: remTime,
      browserEnabled: browserRem,
      emailEnabled: emailRem
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleBrowserToggle = async (checked) => {
    if (checked) {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setBrowserRem(true);
          setRemEnabled(true);
        } else {
          alert('Notification permission was denied by your browser.');
          setBrowserRem(false);
        }
      } else {
        alert('Notifications are not supported by this browser.');
        setBrowserRem(false);
      }
    } else {
      setBrowserRem(false);
    }
  };

  const handleManualSync = async () => {
    if (!user) return;
    setSyncing(true);
    setSyncMsg('');
    try {
      await onSync();
      setSyncMsg('Synced! ✓');
      setTimeout(() => setSyncMsg(''), 2000);
    } catch (err) {
      setSyncMsg('Sync failed.');
      setTimeout(() => setSyncMsg(''), 3000);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.2s ease-out', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem', fontFamily: 'Manrope' }}>
        Settings
      </h2>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Profile Card */}
        <div className="card" style={{ cursor: 'default' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Shield size={16} /> Profile & Account
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>
                {data.name ? `${data.name} (${user ? user.email : 'Guest'})` : (user ? user.email : 'Guest Session')}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {user ? 'All data is synced to the cloud' : 'Local guest data is saved offline'}
              </div>
            </div>
            {!user ? (
              <button 
                type="button"
                className="btn btn-primary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                onClick={onTriggerAuthModal}
              >
                Sync to Cloud
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {syncMsg && <span style={{ fontSize: '0.8rem', color: 'var(--accent-loans)' }}>{syncMsg}</span>}
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onClick={handleManualSync}
                  disabled={syncing}
                >
                  <RefreshCw size={14} className={syncing ? 'spin-anim' : ''} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Budgets Configuration */}
        <div className="card" style={{ cursor: 'default' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <SettingsIcon size={16} /> Monthly Limits
          </h3>

          <div className="input-group">
            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Coffee size={14} style={{ color: 'var(--accent-food)' }} /> Food Budget limit (₹)
            </label>
            <input 
              type="number" 
              className="input-field" 
              placeholder="No limit set" 
              value={food}
              onChange={(e) => setFood(e.target.value)}
            />
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Compass size={14} style={{ color: 'var(--accent-travel)' }} /> Travel Budget limit (₹)
            </label>
            <input 
              type="number" 
              className="input-field" 
              placeholder="No limit set" 
              value={travel}
              onChange={(e) => setTravel(e.target.value)}
            />
          </div>
        </div>

        {/* Reminders Toggle Section */}
        <div className="card" style={{ cursor: 'default' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Bell size={16} /> Daily Reminder Settings
          </h3>

          <div className="switch-container">
            <div>
              <div style={{ fontWeight: '500', fontSize: '0.85rem' }}>Daily Reminders</div>
              <div className="switch-label-desc">Get gently reminded to log spendings</div>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={remEnabled}
                onChange={(e) => {
                  setRemEnabled(e.target.checked);
                  if (!e.target.checked) {
                    setBrowserRem(false);
                  }
                }}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {remEnabled && (
            <div style={{ marginTop: '0.75rem', animation: 'fadeIn 0.2s ease-out' }}>
              <div className="input-group">
                <label className="input-label">Reminder Time</label>
                <input 
                  type="time" 
                  className="input-field" 
                  value={remTime}
                  onChange={(e) => setRemTime(e.target.value)}
                />
              </div>

              <div className="switch-container">
                <div>
                  <div style={{ fontWeight: '500', fontSize: '0.85rem' }}>Browser Push Notifications</div>
                  <div className="switch-label-desc">Direct system popups</div>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={browserRem}
                    onChange={(e) => handleBrowserToggle(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="switch-container">
                <div>
                  <div style={{ fontWeight: '500', fontSize: '0.85rem' }}>Email Reminder</div>
                  <div className="switch-label-desc">Receive evening summary report</div>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={emailRem}
                    onChange={(e) => setEmailRem(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Theme Status */}
        <div className="card" style={{ cursor: 'default' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Moon size={16} /> Appearance Theme
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>
                {theme === 'light' ? 'Light Theme' : 'Dark Theme'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {theme === 'light' ? 'Pop-out colors, minimalist zine design' : 'Linear-inspired premium startup dark theme'}
              </div>
            </div>
            <button 
              type="button"
              className="btn btn-secondary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
              onClick={() => onChangeTheme(theme === 'light' ? 'dark' : 'light')}
            >
              Switch Theme
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
          <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
            {saveSuccess ? 'Saved ✓' : 'Save Changes'}
          </button>
          
          <button 
            type="button" 
            className="btn btn-secondary" 
            style={{ borderColor: 'var(--accent-danger)', color: 'var(--accent-danger)' }}
            onClick={onLogout}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </form>
    </div>
  );
}
