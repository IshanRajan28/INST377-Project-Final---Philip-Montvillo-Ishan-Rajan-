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
        setError(result.error);
      } else {
        setNewTech("");
        setError("");
        if (refreshWatchlist) {
          await refreshWatchlist();
        }
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTech = async (techName) => {
    try {
      const response = await fetch(
        `/api/watchlist?userId=${currentUserId}&tech_name=${techName
          .trim()
          .toLowerCase()}`,
        { method: "DELETE" }
      );
      if (response.ok) {
        setWatchlist(
          watchlist.filter((item) => {
            const currentName = item.tech || item.tech_name;
            return currentName?.toLowerCase() !== techName.trim().toLowerCase();
          })
        );
      } else {
        const result = await response.json();
        setError(result.error);
      }
    } catch (error) {
      setError("Server error while deleting");
    }
  };

  return (
    <div>
      <input
        type="text"
        value={newTech}
        onChange={(change) => setNewTech(change.target.value)}
        placeholder="Add new technology..."
        style={{
          padding: "8px",
          borderRadius: "4px",
          border: "1px solid #ccc",
          marginRight: "8px",
        }}
      />
      <button onClick={addToWatchlist} disabled={isLoading}>
        {isLoading ? "Checking NVD Database..." : "Add"}
      </button>

      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}

      <ul style={{ marginTop: "20px", listStyle: "none", padding: 0 }}>
        {watchlist.map((item, idx) => {
          const nameToDisplay = item.tech || item.tech_name;
          return (
            <li
              key={item.id || nameToDisplay || idx}
              style={{ marginBottom: "10px" }}
            >
              <span
                style={{ textTransform: "capitalize", marginRight: "10px" }}
              >
                {nameToDisplay}
              </span>{" "}
              <button 
              type="button"
              className="removeTechButton"
              onClick={() => deleteTech(nameToDisplay)}
              >
                X
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default Watchlist;
