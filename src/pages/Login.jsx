import { supabase } from "../supabaseClient";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const signIn = async () => {
    if (!email || !password) return alert("Enter email + password");
    if (loading) return;

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) alert(error.message);
    else navigate("/dashboard");

    setLoading(false);
  };

  const signUp = async () => {
    if (!email || !password) return alert("Enter email + password");
    if (loading) return;

    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) alert(error.message);
    else alert("Account created. Check your email for verification!");

    setLoading(false);
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Login</h2>

      <input
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      /><br /><br />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      /><br /><br />

      <button disabled={loading} onClick={signIn}>Login</button>
      <button disabled={loading} onClick={signUp}>Register</button>
    </div>
  );
}