import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext.jsx";
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

// Try to use project's AuthContext if present
let useAuthContext;
try {
  // eslint-disable-next-line import/no-extraneous-dependencies
  // If context exists it should export a useAuth hook
  useAuthContext = require('../context/AuthContext.jsx').useAuth;
} catch (e) {
  useAuthContext = null;
}

export default function Login() {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // if project provides auth, try to use it
  let auth;
  try {
    auth = useAuthContext ? useAuthContext() : null;
  } catch (e) {
    auth = null;
  }

  useEffect(() => {
    // Redirect if already logged in
    if (auth?.user) navigate("/dashboard");
  }, [auth, navigate]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      if (auth && typeof auth.login === 'function') {
        await auth.login({ email, password });
      }
      toast.success('Logged in');
      navigate('/dashboard');
    } catch (err) {
      setError(err?.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      // supabase v2: second arg can include data but older SDKs may differ — keep basic signUp
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message || 'Sign up failed');
      } else {
        setInfo('Check your email for a confirmation link (if enabled). You can now sign in.');
        setMode('signin');
        setPassword('');
      }
    } catch (err) {
      setError(err?.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    if (!email) {
      setError('Enter your email to reset password');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/login'
      });
      if (error) setError(error.message || 'Could not send reset email');
      else setInfo('Password reset email sent — check your inbox.');
    } catch (err) {
      setError(err?.message || 'Could not send reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Minimal demo login: save a demo flag and navigate to dashboard.
    try {
      localStorage.setItem('sc-demo-auth', 'true');
    } catch {}
    toast.success('Logged in (demo)');
    navigate('/dashboard', { replace: true });
  };

  function handleContinue(e) {
    e.preventDefault();
    // NOTE: this is a temporary demo action. Hook into your AuthProvider here.
    navigate('/dashboard');
  }

  function handleDemo() {
    setName('Demo Student');
    setEmail('demo@example.com');
    localStorage.setItem('sc-user', JSON.stringify({ name: 'Demo Student', email: 'demo@example.com' }));
    toast.info('Signed in as demo');
    navigate('/dashboard', { replace: true });
  }

  return (
    <div className="page" style={{ maxWidth: 720, margin: '0 auto' }}>
      <motion.header className="page-header" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
        <h2>Login</h2>
        <p className="muted">Sign in to access your Study Companion dashboard (development stub).</p>
      </motion.header>

      <section className="panel">
        <form onSubmit={handleSubmit} className="form">
          <label className="form__label">
            Name
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </label>

          <label className="form__label">
            Email (optional)
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </label>

          <div className="form__actions">
            <button className="btn btn--primary" type="submit">Continue</button>
            <button type="button" className="btn btn--ghost" onClick={() => { setName(''); setEmail(''); }}>Clear</button>
          </div>
        </form>
      </section>
    </div>
  );
}