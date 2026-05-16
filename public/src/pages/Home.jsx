// Used the supabase react docs to help write my code for this

import "../App.css";
import { useState } from "react";
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
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (login) => {
    login.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) {
      alert(error.message);
    }
    if (data.user) {
      console.log("Logged In!", data.user);
      setCurrentUser(data.user)
    }
    setLoading(false);
  };
  const handleSignUp = async (SignUp) => {
    SignUp.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      alert(error.message);
    }

    if (data.user) {
      alert("Check your email for a confirmation link!");
    }
    setLoading(false);
  };

  //Adding ability to logout.
  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setShowAbout(false);
  };
  
    if (currentUser){
      return (
      <Dashboard 
      currentUserId={currentUser.id}
      onLogout={logout}
        />
      )
    }

    if (showAbout) {
      return <About goBackToLogin={() => setShowAbout(false)} />;
    }

  return (
    <>
      <div className ="loginPageLayout">
      <div className="login-container">
        <h1>Vulnerability Tracker Login Page</h1>
        <form onSubmit={handleLogin}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(change) => setEmail(change.target.value)}
          ></input>

          <br></br>
          <br></br>

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(change) => setPassword(change.target.value)}
          ></input>
          <br></br>

          <button type="submit" disabled={loading} className="login-button">
            Login
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
            Check your email for a confirmation link when you click Sign Up!
          </p>
        </form>
      </div>

        <div className ="aboutSideButtonContainer">
        </div>
      </div>
    </>
  );
}

export default LoginPage;
