const express = require("express");
const path = require("path");
const supabaseClient = require("@supabase/supabase-js");
const dotenv = require("dotenv");

const app = express();
const port = 3000;

dotenv.config({ path: "./.env" });

app.use(express.static("public"));
app.use(express.json());

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const NVD_API_KEY = process.env.NVD_API_KEY;

const supabase = supabaseClient.createClient(supabaseUrl, supabaseServiceKey);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "src", "index.html"));
});

// ENDPOINT 1: To get the watchlist of the user from the database
// Call this endpoint to get the user's watchlist of all of the technologies they are using.
app.get("/api/watchlist", async (req, res) => {
  const userId = req.query.userId;
  if (!userId || userId === "undefined") {
    return res.status(200).json([]);
  }
  try {
    const { data, error } = await supabase
      .from("watchlist")
      .select("*")
      .eq("user_id", userId);
    if (error) {
      console.log(error);
      return res.status(400).json({ error: error.message });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Server failed" });
  }
});

// ENDPOINT 2: Update the watchlist on the database
// Call this endpoint to update the user's watchlist on supabase and the frontend.
app.post("/api/watchlist", async (req, res) => {
  try {
    if (!req.body.tech_name) {
      return res
        .status(400)
        .json({ error: "Technology name cannot be blank!" });
    }
    const userId = req.body.user_id;
    const cleanTechName = req.body.tech_name.trim().toLowerCase();
    if (cleanTechName === "") {
      return res
        .status(400)
        .json({ error: "Technology name cannot be blank!" });
    }

    // Checks if the count of a user's watchlist is greater than 5
    const { count, error: countError } = await supabase
      .from("watchlist")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);
    if (countError) {
      console.log(countError);
      return res.status(400).json({ error: countError.message });
    }

    if (count >= 5) {
      return res
        .status(400)
        .json({ error: "Limit reached! You can only track 5 technologies" });
    }

    // Checks for duplicates
    const { data: existing } = await supabase
      .from("watchlist")
      .select("*")
      .eq("user_id", userId)
      .eq("tech_name", cleanTechName)
      .maybeSingle();

    if (existing) {
      return res
        .status(400)
        .json({ error: "You are already tracking this technology!" });
    }

    // Checks if the technology is part of the NVD database
    try {
      const nvdKeyword = normalizeNvdKeyword(cleanTechName);
      const nvdResponse = await fetch(
        `https://services.nvd.nist.gov/rest/json/cves/2.0?keywordSearch=${encodeURIComponent(nvdKeyword)}&resultsPerPage=5`,
        { headers: nvdHeaders() }
      );

      const nvdData = await nvdResponse.json();

      if (!nvdData.vulnerabilities || nvdData.vulnerabilities.length === 0) {
        return res.status(400).json({
          error: `"${req.body.tech_name}" is not a recognized technology with active entries in the NVD database.`,
        });
      }
    } catch (nvdErr) {
      console.log("NVD API Error:", nvdErr);
      return res
        .status(500)
        .json({ error: "Failed to validate technology with NVD API." });
    }

    // Part that does the updating
    const { data: insertData, error: insertError } = await supabase
      .from("watchlist")
      .insert({
        tech_name: cleanTechName,
        user_id: userId,
      })
      .select("*");
    // .insert.select only show the new row and hence made it easier for you Phillp

    if (insertError) {
      console.log(insertError);
      return res.status(400).json({ error: insertError.message });
    }
    res.json(insertData[0]);
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ error: "Server failed" });
  }
});

const RECENT_YEARS = 2;
const CVE_LIMIT = 5;
const NVD_RESULTS_PAGE = 50;
const NVD_REQUEST_DELAY_MS = 400;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function normalizeNvdKeyword(techName) {
  const key = techName.trim().toLowerCase();
  const aliases = {
    "node.js": "nodejs",
    node: "nodejs",
    "react.js": "react",
    "reactjs": "react",
    "vue.js": "vue",
    "c++": "cpp",
  };
  return aliases[key] || key;
}

function nvdHeaders() {
  return NVD_API_KEY ? { apiKey: NVD_API_KEY } : {};
}

function getPublishedTime(entry) {
  const published = entry?.cve?.published;
  if (!published) return 0;
  const time = new Date(published).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function sortAndLimitVulnerabilities(vulnerabilities, limit = CVE_LIMIT) {
  if (!vulnerabilities?.length) {
    return { items: [], showingHistorical: false };
  }

  const sorted = [...vulnerabilities].sort(
    (a, b) => getPublishedTime(b) - getPublishedTime(a)
  );

  const recentCutoff = new Date();
  recentCutoff.setFullYear(recentCutoff.getFullYear() - RECENT_YEARS);

  const recent = sorted.filter((entry) => {
    const time = getPublishedTime(entry);
    return time > 0 && time >= recentCutoff.getTime();
  });

  if (recent.length > 0) {
    return { items: recent.slice(0, limit), showingHistorical: false };
  }

  const extendedCutoff = new Date();
  extendedCutoff.setFullYear(extendedCutoff.getFullYear() - 5);

  const extended = sorted.filter((entry) => {
    const time = getPublishedTime(entry);
    return time > 0 && time >= extendedCutoff.getTime();
  });

  if (extended.length > 0) {
    return { items: extended.slice(0, limit), showingHistorical: true };
  }

  const withDates = sorted.filter((entry) => getPublishedTime(entry) > 0);
  return {
    items: (withDates.length > 0 ? withDates : sorted).slice(0, limit),
    showingHistorical: true,
  };
}

async function fetchNvdForTech(techName) {
  const keyword = normalizeNvdKeyword(techName);
  const encoded = encodeURIComponent(keyword);
  const url =
    `https://services.nvd.nist.gov/rest/json/cves/2.0?keywordSearch=${encoded}` +
    `&resultsPerPage=${NVD_RESULTS_PAGE}`;

  const response = await fetch(url, { headers: nvdHeaders() });
  const data = await response.json();

  if (!response.ok || data.message) {
    console.log(`NVD error for "${keyword}":`, response.status, data.message || data);
    return { items: [], showingHistorical: false, fetchError: true };
  }

  const result = sortAndLimitVulnerabilities(data.vulnerabilities);
  return {
    items: result.items,
    showingHistorical: result.showingHistorical,
    fetchError: false,
  };
}

// ENDPOINT 3: GET Data from the NVD api
// Borrows the logic from ENDPOINT 1 and 2
app.get("/api/vulnerabilities", async (req, res) => {
  const userId = req.query.userId;
  try {
    const { data, error } = await supabase
      .from("watchlist")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      console.log(error);
      return res.status(400).json({ error: error.message });
    }

    const user_watch_list = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      try {
        const { items, showingHistorical, fetchError } = await fetchNvdForTech(
          row.tech_name
        );

        user_watch_list.push({
          tech: row.tech_name,
          details: {
            vulnerabilities: items,
            showingHistorical,
            fetchError,
          },
        });
      } catch (err) {
        console.log(`Failed fetching NVD data for ${row.tech_name}:`, err);
        user_watch_list.push({
          tech: row.tech_name,
          details: { vulnerabilities: [], fetchError: true },
        });
      }

      if (i < data.length - 1) {
        await delay(NVD_REQUEST_DELAY_MS);
      }
    }

    res.json(user_watch_list);
  } catch (error) {
    console.log("Vulnerabilities Endpoint Error:", error);
    res.status(500).json({ error: "Server failed" });
  }
});
// ENDPOINT 4: Removes a tech from the database nd frontend
app.delete("/api/watchlist", async (req, res) => {
  const userId = req.query.userId;
  const cleanTechName = req.query.tech_name.trim().toLowerCase();

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }
  try {
    const { data, error } = await supabase
      .from("watchlist")
      .delete()
      .eq("user_id", userId)
      .eq("tech_name", cleanTechName);

    return res.status(200).json({ message: "Sucessfully deleted", data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`App is available on port: ${port}`);
});

module.exports = app;
