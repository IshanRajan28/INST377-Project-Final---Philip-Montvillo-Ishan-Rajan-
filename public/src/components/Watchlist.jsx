import { useState } from "react";

function Watchlist({
  currentUserId,
  watchlist,
  setWatchlist,
  refreshWatchlist,
}) {
  const [newTech, setNewTech] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const addToWatchlist = async () => {
    if (!newTech.trim()) return;
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tech_name: newTech.trim().toLowerCase(),
          user_id: currentUserId,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || "Could not add technology.");
      } else {
        setNewTech("");
        if (refreshWatchlist) {
          await refreshWatchlist();
        }
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTech = async (techName) => {
    const displayName = techName.trim();
    if (
      !window.confirm(`Remove "${displayName}" from your watchlist?`)
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/watchlist?userId=${currentUserId}&tech_name=${displayName.toLowerCase()}`,
        { method: "DELETE" }
      );
      if (response.ok) {
        setWatchlist(
          watchlist.filter((item) => {
            const currentName = item.tech || item.tech_name;
            return currentName?.toLowerCase() !== displayName.toLowerCase();
          })
        );
        setError("");
        if (refreshWatchlist) {
          await refreshWatchlist();
        }
      } else {
        const result = await response.json();
        setError(result.error || "Could not remove technology.");
      }
    } catch {
      setError("Server error while deleting. Please try again.");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addToWatchlist();
    }
  };

  const getCveCount = (item) => {
    if (item.details?.loading) return null;
    return item?.details?.vulnerabilities?.length ?? 0;
  };

  return (
    <div className="watchlist-panel">
      <div className="watchlist-add-panel">
      <label htmlFor="watchlist-input" className="visually-hidden">
        Add technology to watchlist
      </label>
      <div className="watchlist-add-row">
        <input
          id="watchlist-input"
          className="watchlist-input"
          type="text"
          value={newTech}
          onChange={(change) => setNewTech(change.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="nodejs, python, react"
          disabled={isLoading}
        />
        <button
          type="button"
          className="watchlist-add-btn"
          onClick={addToWatchlist}
          disabled={isLoading}
        >
          {isLoading ? "..." : "Add"}
        </button>
      </div>

      {error && (
        <p className="banner banner-error banner-compact" role="alert">
          {error}
        </p>
      )}
      </div>

      <ul className="watchlist-items">
        {watchlist.map((item, idx) => {
          const nameToDisplay = item.tech || item.tech_name;
          return (
            <li
              key={item.id || nameToDisplay || idx}
              className="watchlist-item"
            >
              <div className="watchlist-item-label">
                <span className="watchlist-item-name">{nameToDisplay}</span>
                {item.details?.loading ? (
                  <span
                    className="watchlist-cve-count watchlist-cve-count--loading"
                    aria-label="Loading CVE count"
                  >
                    <span className="watchlist-count-spinner" />
                  </span>
                ) : (
                  <span
                    className="watchlist-cve-count"
                    aria-label={`${getCveCount(item)} CVEs found`}
                  >
                    ({getCveCount(item)})
                  </span>
                )}
              </div>
              <button
                type="button"
                className="removeTechButton"
                onClick={() => deleteTech(nameToDisplay)}
                aria-label={`Remove ${nameToDisplay} from watchlist`}
              >
                <span aria-hidden="true">×</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default Watchlist;
