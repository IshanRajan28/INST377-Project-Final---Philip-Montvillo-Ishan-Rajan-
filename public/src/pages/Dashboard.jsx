/*
Just making this stuff a comment because I have an idea for how I would like the flow of this to go.
import React, { useState, useEffect } from 'react';

async function watchlist() {
  const vulnerabilites = await fetch(`/api/vulnerabilities`);
  const user_watch_list = await vulnerabilites.json();
}
*/

//Let's import the watchlist and get this show on the road.

import React, { useState, useEffect, useCallback } from "react";
import Watchlist from "../components/Watchlist";
import WatchlistCarousel from "../components/WatchlistCarousel";

function Dashboard({ currentUserId }) {
  console.log("Dashboard rendered! currentUserId is currently:", currentUserId);
// Temporary test data so we can style the dashboard and work on the carousel, just remove the fake data from inside the const and everything will be good :)
const [watchlist, setWatchlist] = useState([
  {
    tech: "react",
    details: {
      vulnerabilities: [
        {
          cve: {
            id: "CVE-2024-1234",
            published: "2024-10-15T00:00:00.000",
            descriptions: [
              {
                lang: "en",
                value:
                  "Fake React vulnerability data used only for dashboard styling while the backend is being fixed.",
              },
            ],
            metrics: {
              cvssMetricV31: [
                {
                  cvssData: {
                    baseScore: 8.1,
                  },
                },
              ],
            },
          },
        },
        {
          cve: {
            id: "CVE-2024-5678",
            published: "2024-08-21T00:00:00.000",
            descriptions: [
              {
                lang: "en",
                value:
                  "Second fake React CVE so we can test moving through multiple cards in the carousel.",
              },
            ],
            metrics: {
              cvssMetricV31: [
                {
                  cvssData: {
                    baseScore: 5.6,
                  },
                },
              ],
            },
          },
        },
        {
          cve: {
            id: "CVE-2024-9999",
            published: "2024-05-03T00:00:00.000",
            descriptions: [
              {
                lang: "en",
                value:
                  "Third fake React CVE used to make sure the carousel has enough cards to slide through.",
              },
            ],
            metrics: {
              cvssMetricV31: [
                {
                  cvssData: {
                    baseScore: 9.4,
                  },
                },
              ],
            },
          },
        },
      ],
    },
  },
]);
  const [error, setError] = useState("");

  // Maybe useCallback
  const fetchList = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/vulnerabilities?userId=${currentUserId}`
      );
      const data = await response.json();
      setWatchlist(data);
    } catch (error) {
      setError("Failed to load watchlist data.");
    }
  }, [currentUserId]);

  //Disabling this so fake CVE test data stays visible while I wait on getting the needed additional supabase keys.
  //useEffect(() => {
  //  if (currentUserId) {
  //    fetchList();
  //  }
  //}, [currentUserId, fetchList]);

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
            (item) =>
              (item.tech || item.tech_name) !== techName.trim().toLowerCase()
          )
        );
      }
    } catch (error) {
      setError("Server error while deleting");
    }
  };

  if (!currentUserId) {
    return <p>Please log in to view your monitoring dashboard</p>;
  }
  return (
    <main className="dashboardLayout">
      <section className="dashboardWatchlist">
        <h1>Watchlist</h1>
        <Watchlist
          currentUserId={currentUserId}
          watchlist={watchlist}
          setWatchlist={setWatchlist}
          refreshWatchlist={fetchList} // Pass this down so your Add input form can trigger a re-fetch
        />
      </section>

      {/* Cool, now let's add the right side of the dashboard that'll display active threats */}
      <section className="dashboardThreats">
        <h1>Active Threats</h1>
        <WatchlistCarousel watchlist={watchlist} deleteTech={deleteTech} />
      </section>
    </main>
  );
}

export default Dashboard;