// Used the supabase react docs to help write my code for this

import "../App.css";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

function LoginPage() {
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
    if (data) {
      console.log("Logged In!", data.user);
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

    if (data) {
      alert("Check your email for a confirmation link!");
    }
    setLoading(false);
  };
  return (
    <>
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
            SignUp
          </button>
        </form>
      </div>
    </>
  );
}

export default LoginPage;
