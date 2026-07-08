import { useState, useEffect, useCallback, useMemo } from "react";
import Watchlist from "../components/Watchlist";
import WatchlistCarousel from "../components/WatchlistCarousel";
import { summarizeWatchlist } from "../lib/cveHelpers";

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

  const dashboardStats = useMemo(
    () => summarizeWatchlist(watchlist),
    [watchlist]
  );

  const showDashboardStats =
    watchlist.length > 0 &&
    !isLoadingCves &&
    !watchlist.some((item) => item.details?.loading);

  if (!currentUserId) {
    return (
      <p className="dashboard-message">Please log in to view your dashboard.</p>
    );
  }

  return (
    <main className="dashboardLayout">
      <header className="dashboardTopBar">
        <div className="dashboardTopBar-inner">
          <div className="dashboardBrand">
            <div className="dashboardBrand-text">
              <p className="dashboardEyebrow">NVD advisory feed</p>
              <h1 className="dashboardAppTitle">Vulnerability Tracker</h1>
            </div>
            {userEmail && <p className="dashboardUserEmail">{userEmail}</p>}
          </div>

          {showDashboardStats && (
            <div className="dashboardStats" aria-label="Dashboard summary">
              <div className="dashboardStat">
                <span className="dashboardStat-value">
                  {dashboardStats.technologies}
                </span>
                <span className="dashboardStat-label">technologies</span>
              </div>
              <span className="dashboardStat-divider" aria-hidden="true" />
              <div className="dashboardStat">
                <span className="dashboardStat-value">
                  {dashboardStats.advisories}
                </span>
                <span className="dashboardStat-label">advisories</span>
              </div>
              {dashboardStats.highestSeverity && (
                <>
                  <span className="dashboardStat-divider" aria-hidden="true" />
                  <div className="dashboardStat">
                    <span
                      className={`dashboardStat-severity ${dashboardStats.highestSeverity}`}
                    >
                      {dashboardStats.highestSeverity.toUpperCase()}
                    </span>
                    <span className="dashboardStat-label">highest risk</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      <div className="dashboardStatusStrip" role="status">
        <span className="dashboardStatusItem">
          <span className="dashboardStatusDot" aria-hidden="true" />
          Live NVD feed
        </span>
        <span className="dashboardStatusSep" aria-hidden="true">
          ·
        </span>
        <span className="dashboardStatusItem">CVSS severity ranking</span>
        <span className="dashboardStatusSep" aria-hidden="true">
          ·
        </span>
        <span className="dashboardStatusItem">CPE-aware matching</span>
      </div>

      <div className="dashboardColumns">
        <section className="dashboardWatchlist" aria-label="Your stack">
          <div className="panelTitleRow">
            <h2 className="panelTitle">Your stack</h2>
            <span className="panelTitle-meta">up to 5</span>
          </div>

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

        <section className="dashboardThreats" aria-label="Advisories">
          <header className="dashboardThreats-header">
            <div className="dashboardThreats-headerText">
              <div className="dashboardThreats-titleRow">
                <h2>Advisories</h2>
                <span className="sourceBadge">NIST NVD</span>
              </div>
              <p>CVEs matched to your stack with CVSS severity</p>
            </div>
            {showDashboardStats && (
              <p className="dashboardThreats-summary" aria-live="polite">
                {dashboardStats.advisories} total across{" "}
                {dashboardStats.technologies} stack items
              </p>
            )}
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
  );
}

export default Dashboard;
