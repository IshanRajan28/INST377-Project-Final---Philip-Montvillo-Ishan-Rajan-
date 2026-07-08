function About({ goBackToLogin, backButtonText = "Back to sign in" }) {
  const stackItems = [
    "React + Vite",
    "Node.js + Express",
    "Supabase",
    "NIST NVD API",
  ];

  return (
    <main className="aboutPage">
      <section className="aboutCard">
        <header className="aboutCard-header">
          <div className="loginBrandRow">
            <span className="brandMark brandMark--large" aria-hidden="true">
              VT
            </span>
            <p className="aboutEyebrow">Vulnerability Tracker</p>
          </div>
          <div className="aboutTitleRow">
            <h1>How this works</h1>
            <span className="sourceBadge">NIST NVD</span>
          </div>
          <p>
            Pick the technologies you run. The app queries NIST NVD and surfaces
            advisories that match your stack — severity, description, and
            publish date in one feed.
          </p>

          <ol className="aboutPipeline" aria-label="Data flow">
            <li className="aboutPipeline-step">
              <span className="aboutPipeline-label">Watchlist</span>
            </li>
            <li className="aboutPipeline-arrow" aria-hidden="true">
              →
            </li>
            <li className="aboutPipeline-step">
              <span className="aboutPipeline-label">NVD API</span>
            </li>
            <li className="aboutPipeline-arrow" aria-hidden="true">
              →
            </li>
            <li className="aboutPipeline-step">
              <span className="aboutPipeline-label">Advisories</span>
            </li>
          </ol>
        </header>

        <div className="aboutGrid">
          <div className="aboutSection aboutSection-card">
            <span className="aboutSection-index">01</span>
            <h2>The problem</h2>
            <p>
              CVE databases cover every product under the sun. Most entries never
              touch the frameworks, runtimes, or libraries you actually deploy.
            </p>
          </div>

          <div className="aboutSection aboutSection-card">
            <span className="aboutSection-index">02</span>
            <h2>The approach</h2>
            <p>
              Your watchlist persists between sessions. Each technology is
              queried with CPE-aware matching, filtered for relevance, and
              grouped in a browsable dashboard.
            </p>
          </div>

          <div className="aboutSection aboutSection-card aboutSection-card--accent">
            <span className="aboutSection-index">03</span>
            <h2>Try it</h2>
            <p>
              Create an account, then add{" "}
              <span className="aboutInlineCode">nodejs</span>,{" "}
              <span className="aboutInlineCode">python</span>, or{" "}
              <span className="aboutInlineCode">react</span> to see live
              advisories.
            </p>
          </div>
        </div>

        <div className="aboutSection aboutSection-stack">
          <h2>Tech stack</h2>
          <div className="aboutStackBadges">
            {stackItems.map((item) => (
              <span key={item} className="aboutStackBadge">
                {item}
              </span>
            ))}
          </div>
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
