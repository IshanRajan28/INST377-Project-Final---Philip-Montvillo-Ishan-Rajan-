import { useState, useEffect, useCallback, useMemo } from "react";
import Watchlist from "../components/Watchlist";
import WatchlistCarousel from "../components/WatchlistCarousel";
import { summarizeWatchlist } from "../lib/cveHelpers";
import { normalizeTechName } from "../lib/techHelpers";

const SEVERITY_BAR_ORDER = ["critical", "high", "medium", "low"];

function DashboardFeedSkeleton() {
  return (
    <div className="dashboardFeedSkeleton" role="status" aria-live="polite">
      <span className="visually-hidden">Loading advisories from NVD</span>
      {[0, 1].map((row) => (
        <div key={row} className="techRow techRow--skeleton" aria-hidden="true">
          <span className="techRowRail">0{row + 1}</span>
          <div className="techRow-inner">
            <div className="techRowHeader techRowHeader--skeleton" />
            <div className="cve-skeleton-row">
              {[0, 1, 2].map((slot) => (
                <div key={slot} className="cve-skeleton-card" />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Dashboard({ currentUserId, userEmail, onLogout, onShowAbout }) {
  const [watchlist, setWatchlist] = useState([]);
  const [error, setError] = useState("");
  const [isLoadingCves, setIsLoadingCves] = useState(false);
  const [activeTech, setActiveTech] = useState(null);

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

  const handleSelectTech = useCallback((techName) => {
    const key = normalizeTechName(techName);
    setActiveTech(key);

    const target = document.getElementById(`tech-row-${key}`);
    if (!target) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    target.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
  }, []);

  useEffect(() => {
    if (watchlist.length === 0) {
      setActiveTech(null);
      return;
    }

    if (
      activeTech &&
      watchlist.some(
        (item) => normalizeTechName(item.tech || item.tech_name) === activeTech
      )
    ) {
      return;
    }

    const firstTech = watchlist[0]?.tech || watchlist[0]?.tech_name;
    if (firstTech) {
      setActiveTech(normalizeTechName(firstTech));
    }
  }, [watchlist, activeTech]);

  if (!currentUserId) {
    return (
      <p className="dashboard-message">Please log in to view your dashboard.</p>
    );
  }

  return (
    <main className="dashboardLayout">
      <div className="dashboardHeader">
      <header className="dashboardTopBar">
        <div className="dashboardTopBar-inner">
          <div className="dashboardBrand">
            <div className="dashboardBrand-text">
              <div className="dashboardBrand-titleRow">
                <span className="brandMark" aria-hidden="true">
                  VT
                </span>
                <div>
                  <p className="dashboardEyebrow">NVD advisory feed</p>
                  <h1 className="dashboardAppTitle">Vulnerability Tracker</h1>
                </div>
              </div>
            </div>
            {userEmail && <p className="dashboardUserEmail">{userEmail}</p>}
          </div>

          {showDashboardStats && (
            <div className="dashboardStatsGroup">
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
              {dashboardStats.advisories > 0 && (
                <div
                  className="dashboardSeverityBar"
                  role="img"
                  aria-label="Advisory severity distribution"
                >
                  {SEVERITY_BAR_ORDER.map((severity) => {
                    const count = dashboardStats.severityCounts[severity];
                    if (!count) return null;

                    return (
                      <span
                        key={severity}
                        className={`dashboardSeveritySegment ${severity}`}
                        style={{ flexGrow: count }}
                        title={`${count} ${severity}`}
                      />
                    );
                  })}
                </div>
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
            activeTech={activeTech}
            onSelectTech={handleSelectTech}
          />

          <div className="dashboardSidebar-footer">
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
          </div>
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
            <div className="dashboardThreats-actions">
              {showDashboardStats && dashboardStats.advisories > 0 && (
                <div
                  className="dashboardSeverityLegend"
                  aria-label="Severity legend"
                >
                  {SEVERITY_BAR_ORDER.map((severity) => {
                    const count = dashboardStats.severityCounts[severity];
                    if (!count) return null;
                    return (
                      <span
                        key={severity}
                        className={`dashboardSeverityLegend-item ${severity}`}
                      >
                        {count} {severity}
                      </span>
                    );
                  })}
                </div>
              )}
              <button
                type="button"
                className="dashboardRefreshBtn"
                onClick={refreshAll}
                disabled={isLoadingCves}
                aria-busy={isLoadingCves}
              >
                {isLoadingCves ? "Refreshing…" : "Refresh advisories"}
              </button>
            </div>
          </header>

          <div className="dashboardThreats-content">
            {error && (
              <p className="banner banner-error" role="alert">
                {error}
              </p>
            )}

            {isLoadingCves && watchlist.length === 0 ? (
              <DashboardFeedSkeleton />
            ) : (
              <WatchlistCarousel
                watchlist={watchlist}
                isLoading={isLoadingCves}
                activeTech={activeTech}
              />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default Dashboard;
