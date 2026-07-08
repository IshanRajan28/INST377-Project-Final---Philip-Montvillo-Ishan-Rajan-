import { useState } from "react";
import { formatTechDisplayName, normalizeTechName } from "../lib/techHelpers";

const QUICK_TECH = ["node.js", "python", "react"];

function Watchlist({
  currentUserId,
  watchlist,
  setWatchlist,
  refreshWatchlist,
  activeTech,
  onSelectTech,
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
          tech_name: normalizeTechName(newTech),
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
    const displayName = formatTechDisplayName(techName);
    if (
      !window.confirm(`Remove "${displayName}" from your watchlist?`)
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/watchlist?userId=${currentUserId}&tech_name=${encodeURIComponent(normalizeTechName(techName))}`,
        { method: "DELETE" }
      );
      if (response.ok) {
        setWatchlist(
          watchlist.filter((item) => {
            const currentName = item.tech || item.tech_name;
            return normalizeTechName(currentName) !== normalizeTechName(displayName);
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

  const handleItemKeyDown = (event, techName) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelectTech?.(techName);
    }
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
          placeholder="node.js, python, react"
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

      <div className="watchlist-quickAdd">
        {QUICK_TECH.map((tech) => (
          <button
            key={tech}
            type="button"
            className="watchlist-quickChip"
            onClick={() => {
              setNewTech(tech);
              setError("");
            }}
            disabled={isLoading}
          >
            {tech}
          </button>
        ))}
      </div>
      </div>

      <ul className="watchlist-items">
        {watchlist.length === 0 && (
          <li className="watchlist-empty">
            <p>No technologies tracked yet.</p>
            <p className="watchlist-empty-hint">Add node.js, python, or react above.</p>
          </li>
        )}
        {watchlist.map((item, idx) => {
          const nameToDisplay = formatTechDisplayName(item.tech || item.tech_name);
          const techKey = normalizeTechName(nameToDisplay);
          const isActive = activeTech === techKey;

          return (
            <li
              key={item.id || nameToDisplay || idx}
              className={`watchlist-item${isActive ? " watchlist-item--active" : ""}`}
              onClick={() => onSelectTech?.(nameToDisplay)}
              onKeyDown={(event) => handleItemKeyDown(event, nameToDisplay)}
              role="button"
              tabIndex={0}
              aria-current={isActive ? "true" : undefined}
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
                onClick={(event) => {
                  event.stopPropagation();
                  deleteTech(nameToDisplay);
                }}
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
