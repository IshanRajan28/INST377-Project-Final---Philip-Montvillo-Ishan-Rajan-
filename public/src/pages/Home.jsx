// Used the supabase react docs to help write my code for this

import "../App.css";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import About from "./About";
import Dashboard from "./Dashboard";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

function LoginPage() {
  const [showAbout, setShowAbout] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCurrentUser(session.user);
      }
      setAuthReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (login) => {
    login.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) {
      setErrorMessage(error.message);
    } else if (data.user) {
      setCurrentUser(data.user);
    }
    setLoading(false);
  };

  const handleSignUp = async (SignUp) => {
    SignUp.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      setErrorMessage(error.message);
    } else if (data.user) {
      setSuccessMessage("Check your email for a confirmation link!");
    }
    setLoading(false);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setShowAbout(false);
    setErrorMessage("");
    setSuccessMessage("");
  };

  if (!authReady) {
    return (
      <div className="loginPageLayout">
        <p className="auth-loading" role="status">
          Loading...
        </p>
      </div>
    );
  }

  if (showAbout) {
    return (
      <About
        goBackToLogin={() => setShowAbout(false)}
        backButtonText={currentUser ? "Back to Dashboard" : "Back to Login"}
      />
    );
  }

  if (currentUser) {
    return (
      <Dashboard
        currentUserId={currentUser.id}
        userEmail={currentUser.email}
        onLogout={logout}
        onShowAbout={() => setShowAbout(true)}
      />
    );
  }

  return (
    <div className="loginPageLayout">
      <div className="login-container">
        <h1>Vulnerability Tracker</h1>
        <form onSubmit={handleLogin}>
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(change) => setEmail(change.target.value)}
            required
          />

          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(change) => setPassword(change.target.value)}
            required
          />

          {errorMessage && (
            <p className="banner banner-error" role="alert">
              {errorMessage}
            </p>
          )}
          {successMessage && (
            <p className="banner banner-success" role="status">
              {successMessage}
            </p>
          )}

          <button type="submit" disabled={loading} className="login-button">
            {loading ? "Signing in..." : "Login"}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handleSignUp}
            className="signup-button"
          >
            Sign Up
          </button>

          <button
            type="button"
            className="aboutButton"
            onClick={() => setShowAbout(true)}
          >
            About This Project
          </button>

          <p className="message-text">
            New accounts receive a confirmation email after signing up.
          </p>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
