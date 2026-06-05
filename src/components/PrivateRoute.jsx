import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'grid', placeItems: 'center',
        background: 'var(--bg)', color: 'var(--muted)',
      }}>
        <div className="loading-spinner">
          <div className="loading-spinner__ring" />
          <span className="loading-spinner__label">Loading…</span>
        </div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
}