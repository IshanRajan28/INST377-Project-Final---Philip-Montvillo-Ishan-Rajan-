function About({ goBackToLogin, backButtonText = "Back to sign in" }) {
  return (
    <main className="aboutPage">
      <section className="aboutCard">
        <header className="aboutCard-header">
          <h1>How this works</h1>
          <p>
            A focused view of CVEs that match the technologies in your
            development stack — pulled from the National Vulnerability Database.
          </p>
        </header>

        <div className="aboutSection">
          <p className="aboutSection-eyebrow">Overview</p>
          <p>
            Vulnerability databases hold thousands of CVEs across every
            technology imaginable. This app narrows that noise: you pick what you
            run, and the dashboard surfaces advisories that actually apply to
            your stack.
          </p>
        </div>

        <div className="aboutSection">
          <p className="aboutSection-eyebrow">The Problem</p>
          <h2>Too much signal, not enough relevance</h2>
          <p>
            Developers and DevOps teams face information overload when scanning
            raw CVE feeds. Most entries do not touch the frameworks, runtimes, or
            libraries they deploy. Finding what matters means filtering through
            noise by hand.
          </p>
        </div>

        <div className="aboutSection">
          <p className="aboutSection-eyebrow">The Approach</p>
          <h2>Watchlist-driven threat feed</h2>
          <p>
            Your watchlist lives in Supabase and persists between sessions. The
            backend queries the NVD API for each technology you track, then the
            dashboard groups results by stack item — severity, description, and
            publish date in one scrollable feed.
          </p>
        </div>

        <div className="aboutSection">
          <p className="aboutSection-eyebrow">Stack</p>
          <h2>Built with</h2>
          <ul>
            <li>React for the interface</li>
            <li>Node.js and Express for API routes</li>
            <li>Supabase for authentication and watchlist storage</li>
            <li>NVD API for CVE data</li>
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
