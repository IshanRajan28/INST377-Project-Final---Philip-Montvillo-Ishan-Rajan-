import React, { useState, useEffect } from 'react';

async function watchlist() {
  const vulnerabilites = await fetch(`/api/vulnerabilities`);
  const user_watch_list = await vulnerabilites.json();
}
