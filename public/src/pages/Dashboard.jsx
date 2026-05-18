import { useState, useEffect, useCallback } from "react";
import Watchlist from "../components/Watchlist";
import WatchlistCarousel from "../components/WatchlistCarousel";

function Dashboard({ currentUserId, userEmail, onLogout, onShowAbout }) {
  const [watchlist, setWatchlist] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchList = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(
        `/api/vulnerabilities?userId=${currentUserId}`
      );
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Failed to load vulnerability data.");
        setWatchlist([]);
        return;
      }
      setWatchlist(data);
    } catch {
      setError("Failed to load vulnerability data. Please try again.");
      setWatchlist([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    if (currentUserId) {
      fetchList();
    }
  }, [currentUserId, fetchList]);

  if (!currentUserId) {
    return <p className="dashboard-message">Please log in to view your dashboard.</p>;
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
            refreshWatchlist={fetchList}
          />

          <button
            type="button"
            className="dashboardAbout"
            onClick={onShowAbout}
          >
            About This Project
          </button>

          <button type="button" className="dashboardLogout" onClick={onLogout}>
            Log out
          </button>
        </section>

        <section className="dashboardThreats" aria-label="Active threats">
          <h2 className="panelTitle panelTitle-threats">Active Threats</h2>

          {error && (
            <p className="banner banner-error" role="alert">
              {error}
            </p>
          )}

          {isLoading ? (
            <p className="dashboard-loading" role="status">
              Loading vulnerabilities from NVD...
            </p>
          ) : (
            <WatchlistCarousel watchlist={watchlist} />
          )}
        </section>
      </div>
    </main>
  );
}

export default Dashboard;
