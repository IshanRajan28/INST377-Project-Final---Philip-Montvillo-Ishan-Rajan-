// Will work on this Ishan Rajan

import { useState, useEffect } from "react";

function Watchlist() {
  const [watchlist, setWatchlist] = useState([]);
  const [newTech, setNewTech] = useState("");

  useEffect(() => {
    const fetchList = async () => {
      const response = await fetch("/api/watchlist");
      const data = await response.json();
      setWatchlist(data);
    };
    fetchList();
  }, []);
}
