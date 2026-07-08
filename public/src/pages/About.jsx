function About({ goBackToLogin, backButtonText = "Back to sign in" }) {
  return (
    <main className="aboutPage">
      <section className="aboutCard">
        <header className="aboutCard-header">
          <p className="aboutEyebrow">Vulnerability Tracker</p>
          <h1>How this works</h1>
          <p>
            Pick the technologies you run. Vulnerability Tracker queries NIST
            NVD and surfaces advisories that match your stack — severity,
            description, and publish date in one feed.
          </p>
        </header>

        <div className="aboutSection">
          <h2>The problem</h2>
          <p>
            CVE databases cover every product under the sun. Most entries never
            touch the frameworks, runtimes, or libraries you actually deploy.
            Finding what matters means filtering through noise by hand.
          </p>
        </div>

        <div className="aboutSection">
          <h2>The approach</h2>
          <p>
            Your watchlist persists between sessions. For each technology you
            track, the app queries NVD with CPE-aware matching, filters for
            relevance, and groups results in a browsable dashboard.
          </p>
        </div>

        <div className="aboutSection aboutSection-compact">
          <h2>Try it</h2>
          <p>
            Create an account, then add technologies like{" "}
            <span className="aboutInlineCode">nodejs</span>,{" "}
            <span className="aboutInlineCode">python</span>, or{" "}
            <span className="aboutInlineCode">react</span> to see live
            advisories.
          </p>
        </div>

        <div className="aboutSection aboutSection-stack">
          <h2>Tech stack</h2>
          <ul>
            <li>React + Vite</li>
            <li>Node.js + Express</li>
            <li>Supabase (auth + Postgres)</li>
            <li>NIST NVD CVE API 2.0</li>
          </ul>
        </div>

        <footer className="aboutCard-footer">
          <button
            type="button"
            className="backToLoginButton"
            onClick={goBackToLogin}
          >
            {backButtonText}
          </button>
        </footer>
      </section>
    </main>
  );
}

export default About;
