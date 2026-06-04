import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useStudy } from '../context/StudyContext.jsx';
import { useProgress } from '../hooks/useProgress';
import { supabase } from '../supabaseClient';

function initials(name, email) {
  if (name) return name.split(/\s+/).map((s) => s[0]).join('').slice(0, 2).toUpperCase();
  return (email || '?')[0].toUpperCase();
}

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const { subjects } = useStudy();
  const { total, completed, streak } = useProgress();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [info, setInfo] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');

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

  const handleUpdateName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed || trimmed === name) { setEditingName(false); return; }
    setInfo('');
    try {
      const { data, error } = await supabase.auth.updateUser({ data: { full_name: trimmed } });
      if (error) { setInfo(error.message); return; }
      if (data?.user) setUser(data.user);
      setEditingName(false);
      setInfo('Name updated');
    } catch (err) {
      setInfo(err?.message || 'Could not update name');
    }
  };

  if (!user) return null;

  const name = user.user_metadata?.full_name || user.user_metadata?.name || '';
  const email = user.email || '';
  const joined = user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

  return (
    <div className="page">
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div className="panel" style={{ textAlign: 'center', padding: '2rem' }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent), var(--accent-press))',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem',
              fontWeight: 700,
              fontFamily: 'var(--font-display)',
              color: '#fff',
              boxShadow: '0 0 40px var(--accent-glow)',
              marginBottom: '0.75rem',
            }}
          >
            {initials(name, email)}
          </div>
          {editingName ? (
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: '0.2rem' }}>
              <input className="input input--sm" style={{ textAlign: 'center', width: 200 }} value={nameInput} onChange={(e) => setNameInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleUpdateName()} autoFocus />
              <button type="button" className="btn btn--primary btn--sm" onClick={handleUpdateName}>Save</button>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => { setEditingName(false); setNameInput(name); }}>Cancel</button>
            </div>
          ) : (
            <h2
              style={{ margin: '0 0 0.2rem', cursor: 'pointer' }}
              onClick={() => { setNameInput(name); setEditingName(true); }}
              title="Click to edit"
            >
              {name || 'User'} <span style={{ fontSize: '0.7rem', opacity: 0.4, fontWeight: 400 }}>✎</span>
            </h2>
          )}
          <p className="muted" style={{ margin: '0 0 1rem', fontSize: '0.9rem' }}>{email}</p>

          <div className="stat-grid" style={{ marginBottom: 0 }}>
            <div className="stat-card">
              <span className="stat-card__value" style={{ fontSize: '1.3rem' }}>{total}</span>
              <span className="stat-card__label">Tasks</span>
            </div>
            <div className="stat-card">
              <span className="stat-card__value" style={{ fontSize: '1.3rem', color: 'var(--success)' }}>{completed}</span>
              <span className="stat-card__label">Completed</span>
            </div>
            <div className="stat-card">
              <span className="stat-card__value" style={{ fontSize: '1.3rem' }}>{subjects.length}</span>
              <span className="stat-card__label">Subjects</span>
            </div>
            <div className="stat-card">
              <span className="stat-card__value" style={{ fontSize: '1.3rem', color: 'var(--accent)' }}>{streak.current}</span>
              <span className="stat-card__label">Day streak</span>
            </div>
          </div>
        </div>

        <div className="panel" style={{ marginTop: '1rem' }}>
          <h3 className="panel__title">Account details</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
              <span className="muted">Name</span>
              <span>{name || '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
              <span className="muted">Email</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{email}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="muted">Joined</span>
              <span>{joined}</span>
            </div>
          </div>
        </div>

        <div className="panel" style={{ marginTop: '1rem' }}>
          <h3 className="panel__title">Change password</h3>
          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label className="form__label">
              New password
              <input type="password" className="input" placeholder="Enter new password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
            {info && <div className="muted small">{info}</div>}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" disabled={loading} className="btn btn--primary">{loading ? 'Updating…' : 'Update password'}</button>
              <button type="button" onClick={handleSignOut} className="btn btn--danger">Sign out</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
