// Minimal Profile page for src/pages to match the app structure
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { supabase } from '../supabaseClient';

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [info, setInfo] = useState('');

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setInfo('');
    if (!password || password.length < 6) {
      setInfo('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) setInfo(error.message || 'Could not change password');
      else setInfo('Password updated successfully');
    } catch (err) {
      setInfo(err?.message || 'Could not change password');
    } finally {
      setLoading(false);
      setPassword('');
    }
  };

  if (!user) return null;

  return (
    <div className="page">
      <div style={{ maxWidth: 520, margin: '2rem auto' }} className="panel">
        <h2 className="page-header">Profile</h2>
        <p className="muted">Account information</p>
        <div style={{ marginTop: 12 }}>
          <div style={{ marginBottom: 8 }}><strong>Name</strong></div>
          <div style={{ marginBottom: 12 }}>{user.user_metadata?.full_name || user.user_metadata?.name || '—'}</div>

          <div style={{ marginBottom: 8 }}><strong>Email</strong></div>
          <div style={{ fontFamily: 'var(--font-mono)', background: 'var(--surface-2)', padding: '0.6rem 0.75rem', borderRadius: 8 }}>{user.email}</div>

          <div style={{ marginTop: 12 }}>
            <div style={{ marginBottom: 8 }}><strong>Date joined</strong></div>
            <div className="muted">{user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}</div>
          </div>
        </div>

        <form onSubmit={handleChangePassword} style={{ marginTop: 16 }}>
          <h3 className="panel__title">Change password</h3>
          <label className="form__label">
            New password
            <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          {info && <div className="muted" style={{ marginBottom: 8 }}>{info}</div>}
          <div>
            <button type="submit" disabled={loading} className="btn btn--primary">{loading ? 'Updating…' : 'Change password'}</button>
            <button type="button" onClick={handleSignOut} className="btn btn--danger" style={{ marginLeft: 8 }}>Sign out</button>
          </div>
        </form>
      </div>
    </div>
  );
}
