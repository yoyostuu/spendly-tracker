import React, { useState } from 'react';
import { Sparkles, Mail, Lock, Bell, ArrowRight, User } from 'lucide-react';
import { api } from '../utils/api';

export default function Onboarding({ onComplete, onSetUser, initialStep = 1 }) {
  const [step, setStep] = useState(initialStep); // 1: Welcome, 2: Auth (Sync), 3: Reminders
  const [isLogin, setIsLogin] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Reminders States
  const [reminderTime, setReminderTime] = useState('20:00');
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [showTimeSelect, setShowTimeSelect] = useState(false);

  const handleGuestContinue = () => {
    // Continue as guest -> go to reminders setting
    setStep(3);
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !name.trim())) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const response = await api.login(email, password);
        onSetUser({ email: response.email, data: response.data });
        
        if (response.data?.reminders?.enabled) {
          onComplete(response.data.reminders);
          return;
        }
      } else {
        const response = await api.register(email, password, name.trim());
        // Automatically login user
        const loginResponse = await api.login(email, password);
        onSetUser({ email: loginResponse.email, data: loginResponse.data });
        
        if (loginResponse.data?.reminders?.enabled) {
          onComplete(loginResponse.data.reminders);
          return;
        }
      }
      setStep(3); // Advance to reminders after auth
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationSetup = async (wantsNotifications) => {
    let browserEnabled = false;

    if (wantsNotifications) {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          browserEnabled = true;
        }
      }
      // If permission is denied, we just proceed.
      onComplete({
        reminders: {
          enabled: true,
          time: reminderTime,
          browserEnabled,
          emailEnabled
        }
      });
    } else {
      onComplete({
        reminders: {
          enabled: false,
          time: '20:00',
          browserEnabled: false,
          emailEnabled: false
        }
      });
    }
  };

  return (
    <div className="onboarding-screen">
      {/* Logo Icon */}
      <div className="logo-container">
        <Sparkles size={28} style={{ color: 'var(--accent-savings)' }} />
        <span className="logo-text">Spendly</span>
      </div>

      {step === 1 && (
        <div style={{ animation: 'slideUp 0.3s ease-out' }}>
          <h1 className="onboarding-headline">Track your money in seconds.</h1>
          <p className="onboarding-sub">A simple money companion for students.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button className="btn btn-primary" style={{ padding: '0.9rem' }} onClick={handleGuestContinue}>
              Continue as Guest
            </button>
            <button className="btn btn-secondary" style={{ padding: '0.9rem' }} onClick={() => setStep(2)}>
              Sync My Data
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div style={{ animation: 'slideUp 0.3s ease-out', textAlign: 'left' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem', fontFamily: 'Manrope' }}>
            {isLogin ? 'Welcome back' : 'Sync your data'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            {isLogin 
              ? 'Log in to recover your budgets and timeline.' 
              : 'Create an account to securely sync across your devices.'}
          </p>

          {error && (
            <div style={{ background: 'rgba(248, 113, 113, 0.1)', border: '1px solid var(--accent-danger)', borderRadius: '10px', padding: '0.75rem', marginBottom: '1rem', color: 'var(--accent-danger)', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleAuthSubmit}>
            {!isLogin && (
              <div className="input-group" style={{ animation: 'fadeIn 0.2s ease-out' }}>
                <label className="input-label">Your Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input
                    type="text"
                    className="input-field"
                    style={{ width: '100%', paddingLeft: '2.5rem' }}
                    placeholder="e.g. Rahul"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="input-group">
              <label className="input-label">Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  type="email"
                  className="input-field"
                  style={{ width: '100%', paddingLeft: '2.5rem' }}
                  placeholder="name@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  type="password"
                  className="input-field"
                  style={{ width: '100%', paddingLeft: '2.5rem' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', padding: '0.85rem' }} disabled={loading}>
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
            <button 
              className="btn" 
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.85rem' }}
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Log In'}
            </button>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            <button 
              className="btn btn-secondary" 
              style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
              onClick={() => setStep(3)}
            >
              Not Now
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div style={{ animation: 'slideUp 0.3s ease-out' }}>
          <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '50%', marginBottom: '1rem', border: '1px solid var(--border-color)' }}>
            <Bell size={32} style={{ color: 'var(--accent-travel)' }} />
          </div>

          {!showTimeSelect ? (
            <>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem', fontFamily: 'Manrope' }}>
                Would you like daily reminders?
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                Keep your streaks alive. We can gently remind you to log your daily expenses.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button className="btn btn-primary" onClick={() => setShowTimeSelect(true)}>
                  Turn On
                </button>
                <button className="btn btn-secondary" onClick={() => handleNotificationSetup(false)}>
                  Not Now
                </button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'left', animation: 'fadeIn 0.2s ease-out' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '1rem', fontFamily: 'Manrope', textAlign: 'center' }}>
                Set up your reminders
              </h2>

              <div className="input-group">
                <label className="input-label">Daily Reminder Time</label>
                <input
                  type="time"
                  className="input-field"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                />
              </div>

              <div className="switch-container">
                <div>
                  <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>Email Notifications</div>
                  <div className="switch-label-desc">Receive a daily evening summary</div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={emailEnabled}
                    onChange={(e) => setEmailEnabled(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button className="btn btn-primary" onClick={() => handleNotificationSetup(true)}>
                  Enable & Continue <ArrowRight size={16} />
                </button>
                <button className="btn btn-secondary" style={{ textAlign: 'center' }} onClick={() => handleNotificationSetup(false)}>
                  Skip
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
