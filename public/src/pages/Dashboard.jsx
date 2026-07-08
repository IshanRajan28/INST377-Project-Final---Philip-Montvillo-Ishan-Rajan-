import { useState, useEffect, useCallback } from "react";
import { Shield } from "lucide-react";
import Watchlist from "../components/Watchlist";
import WatchlistCarousel from "../components/WatchlistCarousel";
import VideoBackground from "../components/VideoBackground";

function Dashboard({ currentUserId, userEmail, onLogout, onShowAbout }) {
  const [watchlist, setWatchlist] = useState([]);
  const [error, setError] = useState("");
  const [isLoadingCves, setIsLoadingCves] = useState(false);

  const fetchWatchlistNames = useCallback(async () => {
    const response = await fetch(`/api/watchlist?userId=${currentUserId}`);
    const data = await response.json();
    if (!response.ok || !Array.isArray(data)) return;

    setWatchlist(
      data.map((row) => ({
        tech: row.tech_name,
        details: { vulnerabilities: [], loading: true },
      }))
    );
  }, [currentUserId]);

  const fetchVulnerabilities = useCallback(async () => {
    setIsLoadingCves(true);
    setError("");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000);

    try {
      const response = await fetch(
        `/api/vulnerabilities?userId=${currentUserId}`,
        { signal: controller.signal }
      );
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to load vulnerability data.");
        return;
      }

      setWatchlist(data);
    } catch (err) {
      if (err.name === "AbortError") {
        setError(
          "Loading timed out. Try fewer watchlist items or refresh in a moment."
        );
      } else {
        setError("Failed to load vulnerability data. Please try again.");
      }
    } finally {
      clearTimeout(timeoutId);
      setIsLoadingCves(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId) return;

    const loadDashboard = async () => {
      try {
        await fetchWatchlistNames();
      } catch {
        /* sidebar can still load via vulnerabilities response */
      }
      await fetchVulnerabilities();
    };

    loadDashboard();
  }, [currentUserId, fetchWatchlistNames, fetchVulnerabilities]);

  const refreshAll = useCallback(async () => {
    await fetchVulnerabilities();
  }, [fetchVulnerabilities]);

  if (!currentUserId) {
    return (
      <VideoBackground>
        <p className="dashboard-message">Please log in to view your dashboard.</p>
      </VideoBackground>
    );
  }

  return (
    <VideoBackground>
      <main className="dashboardLayout">
        <header className="dashboardTopBar liquid-glass-strong">
          <div className="dashboardBrand">
            <div className="brand-lockup">
              <span className="icon-circle">
                <Shield size={16} />
              </span>
              <h1 className="dashboardAppTitle">Vulnerability Tracker</h1>
            </div>
            {userEmail && <p className="dashboardUserEmail">{userEmail}</p>}
          </div>
        </header>

        <div className="dashboardColumns">
          <section
            className="dashboardWatchlist liquid-glass-strong"
            aria-label="Your stack"
          >
            <h2 className="panelTitle">Your stack</h2>

            <Watchlist
              currentUserId={currentUserId}
              watchlist={watchlist}
              setWatchlist={setWatchlist}
              refreshWatchlist={refreshAll}
            />

            <button
              type="button"
              className="text-link dashboardAbout"
              onClick={onShowAbout}
            >
              How this works
            </button>

            <button
              type="button"
              className="dashboardLogout liquid-glass interactive-scale"
              onClick={onLogout}
            >
              Log out
            </button>
          </section>

          <section
            className="dashboardThreats liquid-glass-strong"
            aria-label="Advisories"
          >
            <header className="dashboardThreats-header">
              <h2>Advisories</h2>
              <p>CVEs from NVD matched to your stack</p>
            </header>

            <div className="dashboardThreats-content">
              {error && (
                <p className="banner banner-error" role="alert">
                  {error}
                </p>
              )}

              {isLoadingCves && (
                <p className="dashboard-loading" role="status">
                  Loading advisories from NVD…
                </p>
              )}

              <WatchlistCarousel
                watchlist={watchlist}
                isLoading={isLoadingCves}
              />
            </div>
          </section>
        </div>
      </main>
    </VideoBackground>
  );
}

export default Dashboard;
