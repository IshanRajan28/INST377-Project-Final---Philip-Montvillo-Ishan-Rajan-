// Will work on this Ishan Rajan

import { useState, useEffect } from "react";

function Watchlist({ currentUserId }) {
  const [watchlist, setWatchlist] = useState([]);
  const [newTech, setNewTech] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchList = async () => {
      const response = await fetch(`/api/watchlist?userId=${currentUserId}`);
      const data = await response.json();
      setWatchlist(data);
    };
    if (currentUserId) fetchList();
  }, [currentUserId]);

  const addToWatchlist = async () => {
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
      <button onClick={addToWatchlist}>Add</button>

      <ul>
        {watchlist.map((item) => (
          <li key={item.id}>{item.tech_name}</li>
        ))}
      </ul>
    </div>
  );
}

export default Watchlist;
