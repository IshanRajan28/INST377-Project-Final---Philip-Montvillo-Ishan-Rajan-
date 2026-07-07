import { useState, useEffect, useCallback } from "react";
import Watchlist from "../components/Watchlist";
import WatchlistCarousel from "../components/WatchlistCarousel";

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
      <p className="dashboard-message">Please log in to view your dashboard.</p>
    );
  }

  return (
    <main className="dashboardLayout">
      <header className="dashboardTopBar">
        <div className="dashboardBrand">
          <h1 className="dashboardAppTitle">Vulnerability Tracker</h1>
          {userEmail && <p className="dashboardUserEmail">{userEmail}</p>}
        </div>
      </header>

      <div className="dashboardColumns">
        <section className="dashboardWatchlist" aria-label="Watchlist">
          <h2 className="panelTitle">Watchlist</h2>

          <Watchlist
            currentUserId={currentUserId}
            watchlist={watchlist}
            setWatchlist={setWatchlist}
            refreshWatchlist={refreshAll}
          />

          <button
            type="button"
            className="textLink-button dashboardAbout"
            onClick={onShowAbout}
          >
            How this works
          </button>

          <button type="button" className="dashboardLogout" onClick={onLogout}>
            Log out
          </button>
        </section>

        <section className="dashboardThreats" aria-label="Active threats">
          <header className="dashboardThreats-header">
            <h2>Active Threats</h2>
          </header>

          <div className="dashboardThreats-content">
          {error && (
            <p className="banner banner-error" role="alert">
              {error}
            </p>
          )}

          {isLoadingCves && (
            <p className="dashboard-loading" role="status">
              Fetching CVEs from the National Vulnerability Database…
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
  );
}

export default Dashboard;
