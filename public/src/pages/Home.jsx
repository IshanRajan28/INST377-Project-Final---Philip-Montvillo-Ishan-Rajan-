// Used the supabase react docs to help write my code for this

import "../App.css";
import { useState, useEffect } from "react";
import {
  Shield,
  Download,
  Wand2,
  BookOpen,
  ArrowRight,
  Globe,
  Rss,
  Share2,
  Menu,
  Sparkles,
} from "lucide-react";
import About from "./About";
import Dashboard from "./Dashboard";
import VideoBackground from "../components/VideoBackground";
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
      <VideoBackground>
        <p className="auth-loading" role="status">
          Loading...
        </p>
      </VideoBackground>
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
    <VideoBackground>
      <div className="hero-layout">
        <div className="hero-left">
          <div className="hero-panel liquid-glass-strong">
            <nav className="hero-nav">
              <div className="brand-lockup">
                <span className="icon-circle">
                  <Shield size={18} strokeWidth={1.75} />
                </span>
                <span className="brand-name">tracker</span>
              </div>
              <button
                type="button"
                className="menu-pill liquid-glass interactive-scale"
                onClick={() => setShowAbout(true)}
              >
                <Menu size={16} />
                Menu
              </button>
            </nav>

            <div className="hero-center">
              <span className="icon-circle hero-logo liquid-glass">
                <Shield size={36} strokeWidth={1.5} />
              </span>

              <h1 className="hero-title">
                Tracking the <em>spirit of your stack</em>
              </h1>

              <form className="auth-form" onSubmit={handleLogin} noValidate>
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
                  className="auth-cta liquid-glass-strong interactive-scale"
                  aria-busy={authAction === "signIn"}
                >
                  <span className="icon-circle icon-circle-sm">
                    <Download size={14} />
                  </span>
                  {authAction === "signIn" ? "Signing in..." : "Sign in"}
                </button>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleSignUp}
                  className="auth-secondary liquid-glass interactive-scale"
                  aria-busy={authAction === "signUp"}
                >
                  {authAction === "signUp"
                    ? "Creating account..."
                    : "Create account"}
                </button>

                <p className="auth-hint">
                  New accounts need email confirmation before you can sign in.
                </p>
              </form>

              <div className="hero-pills">
                <span className="hero-pill liquid-glass">CVE feed</span>
                <span className="hero-pill liquid-glass">Stack watchlist</span>
                <span className="hero-pill liquid-glass">Severity scores</span>
              </div>
            </div>

            <footer className="hero-quote">
              <p className="quote-label">Threat intelligence</p>
              <p className="quote-text">
                <span>See only the advisories that </span>
                <em>match what you run.</em>
              </p>
              <p className="quote-author">VULNERABILITY TRACKER</p>
            </footer>
          </div>
        </div>

        <aside className="hero-right">
          <div className="hero-right-top">
            <div className="social-pill liquid-glass">
              <a
                href="https://nvd.nist.gov/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link icon-circle"
                aria-label="NVD"
              >
                <Globe size={14} />
              </a>
              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link icon-circle"
                aria-label="Share"
              >
                <Share2 size={14} />
              </a>
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link icon-circle"
                aria-label="Feed"
              >
                <Rss size={14} />
              </a>
              <span className="icon-circle">
                <ArrowRight size={14} />
              </span>
            </div>
            <button
              type="button"
              className="icon-circle liquid-glass interactive-scale"
              aria-label="Account"
            >
              <Sparkles size={16} />
            </button>
          </div>

          <div className="community-card liquid-glass">
            <h3>How this works</h3>
            <p>
              Build a watchlist, pull CVEs from NVD, and read advisories grouped
              by technology.
            </p>
            <button
              type="button"
              className="text-link"
              onClick={() => setShowAbout(true)}
            >
              Read more
            </button>
          </div>

          <div className="hero-features liquid-glass-strong">
            <div className="feature-row">
              <div className="feature-card liquid-glass">
                <span className="icon-circle">
                  <Wand2 size={16} />
                </span>
                <h4>CVE scanning</h4>
                <p>Query NVD for each item on your stack watchlist.</p>
              </div>
              <div className="feature-card liquid-glass">
                <span className="icon-circle">
                  <BookOpen size={16} />
                </span>
                <h4>Advisory archive</h4>
                <p>Severity, description, and publish date in one feed.</p>
              </div>
            </div>

            <div className="feature-bottom liquid-glass">
              <img
                className="feature-thumb"
                src="https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=200&h=140&fit=crop"
                alt=""
              />
              <div className="feature-bottom-text">
                <h4>Stack-aware monitoring</h4>
                <p>Filter noise. Focus on CVEs that apply to your technologies.</p>
              </div>
              <button
                type="button"
                className="icon-circle liquid-glass interactive-scale"
                onClick={() => setShowAbout(true)}
                aria-label="Learn more"
              >
                +
              </button>
            </div>
          </div>
        </aside>
      </div>
    </VideoBackground>
  );
}

export default LoginPage;
