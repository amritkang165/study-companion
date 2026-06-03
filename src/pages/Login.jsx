import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

export default function Login() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    try {
      localStorage.setItem("sc-demo-auth", "true");

      localStorage.setItem(
        "sc-user",
        JSON.stringify({
          name: name || "Student",
          email: email || "student@example.com",
        })
      );
    } catch (err) {
      console.error(err);
    }

    toast.success("Logged in");
    navigate("/dashboard", { replace: true });
  };

  const handleDemo = () => {
    const demoUser = {
      name: "Demo Student",
      email: "demo@example.com",
    };

    localStorage.setItem("sc-demo-auth", "true");
    localStorage.setItem("sc-user", JSON.stringify(demoUser));

    toast.info("Signed in as Demo Student");
    navigate("/dashboard", { replace: true });
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
        <form onSubmit={handleSubmit} className="form">
          <label className="form__label">
            Name
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </label>

          <label className="form__label">
            Email
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </label>

          <div className="form__actions">
            <button className="btn btn--primary" type="submit">
              Continue
            </button>

            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => {
                setName("");
                setEmail("");
              }}
            >
              Clear
            </button>

            <button
              type="button"
              className="btn btn--ghost"
              onClick={handleDemo}
            >
              Demo Login
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}