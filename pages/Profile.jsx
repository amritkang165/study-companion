import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { supabase } from "../src/supabaseClient.js";

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-80 text-center">
        <h2 className="text-2xl font-bold mb-4">Profile</h2>
        <div className="mb-4">Logged in as:<br /><span className="font-mono">{user.email}</span></div>
        <button onClick={handleSignOut} className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700">Sign Out</button>
      </div>
    </div>
  );
}
