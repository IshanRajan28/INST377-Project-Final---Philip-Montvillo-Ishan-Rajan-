/*
Just making this stuff a comment because I have an idea for how I would like the flow of this to go.
import React, { useState, useEffect } from 'react';

async function watchlist() {
  const vulnerabilites = await fetch(`/api/vulnerabilities`);
  const user_watch_list = await vulnerabilites.json();
}
*/

//Let's import the watchlist and get this show on the road. 

/*This imports the watchlist component and creates the dashboard.
  It'll also accept the logged-in users ID and then give the user ID 
  to the watchlist so it can display the correct watchlist */
import Watchlist from "../components/Watchlist";
function Dashboard({ currentUserId }) {
  return (
    <main className="dashboardLayout">
      <section className = "dashboardWatchlist">
          <h1>Watchlist</h1>
          <Watchlist currentUserId={currentUserId} />
      </section>
    </main>
  )
}

export default Dashboard;
