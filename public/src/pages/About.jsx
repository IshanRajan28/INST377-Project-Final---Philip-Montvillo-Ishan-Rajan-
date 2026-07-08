import VideoBackground from "../components/VideoBackground";

function About({ goBackToLogin, backButtonText = "Back to sign in" }) {
  return (
    <VideoBackground>
      <main className="aboutPage">
        <section className="aboutCard liquid-glass-strong">
          <header className="aboutCard-header">
            <h1>How this works</h1>
            <p>
              Vulnerability Tracker surfaces CVEs that match the technologies in
              your development stack.
            </p>
          </header>

          <div className="aboutSection">
            <p>
              Vulnerability databases hold thousands of CVEs across every
              technology imaginable. This app narrows that noise: you pick what
              you run, and the dashboard surfaces advisories that actually apply
              to your stack.
            </p>
          </div>

          <div className="aboutSection">
            <h2>The problem</h2>
            <p>
              Developers and DevOps teams face information overload when scanning
              raw CVE feeds. Most entries do not touch the frameworks, runtimes, or
              libraries they deploy. Finding what matters means filtering through
              noise by hand.
            </p>
          </div>

          <div className="aboutSection">
            <h2>The approach</h2>
            <p>
              Your watchlist persists between sessions. The app queries the NVD
              API for each technology you track, then groups results by stack item:
              severity, description, and publish date in one feed.
            </p>
          </div>

          <div className="aboutSection">
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
              className="backToLoginButton liquid-glass interactive-scale"
              onClick={goBackToLogin}
            >
              {backButtonText}
            </button>
          </footer>
        </section>
      </main>
    </VideoBackground>
  );
}

export default About;
