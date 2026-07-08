// Used the supabase react docs to help write my code for this

import "../App.css";
import { useState, useEffect } from "react";
import About from "./About";
import Dashboard from "./Dashboard";
import { supabase } from "../lib/supabaseClient";
import {
  validateAuthInput,
  formatAuthError,
  getSignUpResultMessage,
} from "../lib/authHelpers";

function LoginPage() {
  const [showAbout, setShowAbout] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [authAction, setAuthAction] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const isLoading = authAction !== null;

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Failed to restore session:", error.message);
        } else if (isMounted && data.session?.user) {
          setCurrentUser(data.session.user);
        }
      } catch {
        if (isMounted) {
          setErrorMessage(
            "Could not connect to authentication. Check your connection and try again."
          );
        }
      } finally {
        if (isMounted) {
          setAuthReady(true);
        }
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setCurrentUser(session?.user ?? null);
      if (session?.user) {
        setErrorMessage("");
        setSuccessMessage("");
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const clearAuthFeedback = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
    clearAuthFeedback();
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
    clearAuthFeedback();
  };

  const resetAuthForm = () => {
    setEmail("");
    setPassword("");
    clearAuthFeedback();
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    const validation = validateAuthInput(email, password);
    if (!validation.ok) {
      setErrorMessage(validation.message);
      setSuccessMessage("");
      return;
    }

    setAuthAction("signIn");
    clearAuthFeedback();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: validation.email,
        password,
      });

      if (error) {
        setErrorMessage(formatAuthError(error));
        return;
      }

      if (data.user) {
        setCurrentUser(data.user);
        resetAuthForm();
      }
    } catch {
      setErrorMessage(
        "Could not sign in. Check your connection and try again."
      );
    } finally {
      setAuthAction(null);
    }
  };

  const handleSignUp = async () => {
    const validation = validateAuthInput(email, password, { forSignUp: true });
    if (!validation.ok) {
      setErrorMessage(validation.message);
      setSuccessMessage("");
      return;
    }

    setAuthAction("signUp");
    clearAuthFeedback();

    try {
      const { data, error } = await supabase.auth.signUp({
        email: validation.email,
        password,
      });

      if (error) {
        setErrorMessage(formatAuthError(error));
        return;
      }

      const result = getSignUpResultMessage(data);
      if (result.type === "error") {
        setErrorMessage(result.message);
        return;
      }

      setSuccessMessage(result.message);
      setPassword("");

      if (data.session?.user) {
        setCurrentUser(data.session.user);
        resetAuthForm();
      }
    } catch {
      setErrorMessage(
        "Could not create account. Check your connection and try again."
      );
    } finally {
      setAuthAction(null);
    }
  };

  const logout = async () => {
    setAuthAction("signOut");
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign out failed:", error.message);
      }
    } catch {
      console.error("Sign out failed due to a network error.");
    } finally {
      setCurrentUser(null);
      setShowAbout(false);
      resetAuthForm();
      setAuthAction(null);
    }
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
        backButtonText={currentUser ? "Back to dashboard" : "Back to sign in"}
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
        <header className="login-container-header">
          <p className="login-eyebrow">Vulnerability Tracker</p>
          <h1 className="login-heroTitle">CVE feed for your stack</h1>
          <p className="login-heroText">
            Sign in to track technologies and read matching advisories.
          </p>

          <div className="login-advisory-specimen" aria-hidden="true">
            <div className="login-specimen-meta">
              <span className="login-specimen-id">CVE-2024-21896</span>
              <span className="severityBadge high">HIGH 7.5</span>
            </div>
            <p className="login-specimen-desc">
              Node.js HTTP request smuggling via malformed Transfer-Encoding
              headers.
            </p>
            <span className="login-specimen-tag">nodejs</span>
          </div>
        </header>
        <form onSubmit={handleLogin} noValidate>
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={handleEmailChange}
            disabled={isLoading}
            required
          />

          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={handlePasswordChange}
            disabled={isLoading}
            minLength={6}
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

          <button
            type="submit"
            disabled={isLoading}
            className="login-button"
            aria-busy={authAction === "signIn"}
          >
            {authAction === "signIn" ? "Signing in..." : "Sign in"}
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={handleSignUp}
            className="signup-button"
            aria-busy={authAction === "signUp"}
          >
            {authAction === "signUp" ? "Creating account..." : "Create account"}
          </button>

          <p className="message-text">
            New accounts need email confirmation before you can sign in.
          </p>

          <div className="login-form-footer">
            <button
              type="button"
              className="textLink-button"
              onClick={() => setShowAbout(true)}
              disabled={isLoading}
            >
              How this works
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
