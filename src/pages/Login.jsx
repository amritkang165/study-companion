import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { supabase } from "../supabaseClient";

export default function Login() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Logged in");
    navigate("/dashboard", { replace: true });
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      toast.warning("Enter email and password");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name || email.split("@")[0] } },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Check your email to confirm sign up");
  };

  return (
    <div
      className="page"
      style={{
        maxWidth: "720px",
        margin: "0 auto",
      }}
    >
      <motion.header
        className="page-header"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2>Login</h2>
        <p className="muted">
          Sign in to access your Study Companion dashboard.
        </p>
      </motion.header>

      <section className="panel">
        <form onSubmit={handleLogin} className="form">
          <label className="form__label">
            Name
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </label>

          <label className="form__label">
            Email
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          </label>

          <label className="form__label">
            Password
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" required />
          </label>

          <div className="form__actions">
            <button className="btn btn--primary" type="submit" disabled={loading}>
              {loading ? "Signing in…" : "Log in"}
            </button>

            <button type="button" className="btn btn--ghost" onClick={handleSignUp} disabled={loading}>
              Sign up
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}