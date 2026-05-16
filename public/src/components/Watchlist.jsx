import { useState, useEffect } from "react";

function Watchlist({ currentUserId }) {
  const [watchlist, setWatchlist] = useState([]);
  const [newTech, setNewTech] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchList = async () => {
      const response = await fetch(`/api/watchlist?userId=${currentUserId}`);
      const data = await response.json();
      setWatchlist(data);
    };
    if (currentUserId) fetchList();
  }, [currentUserId]);

  const addToWatchlist = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tech_name: newTech,
          user_id: currentUserId,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error);
      } else {
        setWatchlist([...watchlist, result]);
        setNewTech("");
        setError("");
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
          watchlist.filter(
            (item) => item.tech_name !== techName.trim().toLowerCase()
          )
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
      <h2>My Tech Watchlist</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}
      <input
        type="text"
        value={newTech}
        onChange={(change) => setNewTech(change.target.value)}
        placeholder="Add new technology..."
      />
      <button onClick={addToWatchlist} disabled={isLoading}>
        {isLoading ? "Checking NVD Database..." : "Add"}
      </button>

      <ul>
        {watchlist.map((item) => (
          <li key={item.id}>
            {item.tech_name}{" "}
            <button onClick={() => deleteTech(item.tech_name)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Watchlist;
