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
      const nvdResponse = await fetch(
        `https://services.nvd.nist.gov/rest/json/cves/2.0?keywordSearch=${cleanTechName}`,
        {
          headers: {
            apiKey: NVD_API_KEY,
          },
        }
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

function filterRecentVulnerabilities(vulnerabilities) {
  if (!vulnerabilities?.length) return [];
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - RECENT_YEARS);

  const recent = vulnerabilities.filter((entry) => {
    const published = entry?.cve?.published;
    if (!published) return false;
    return new Date(published) >= cutoff;
  });

  return recent.length > 0 ? recent : vulnerabilities.slice(0, 5);
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

    const fetchPromises = data.map(async (row) => {
      try {
        const convertedName = encodeURIComponent(row.tech_name);
        const NVD_Data = await fetch(
          `https://services.nvd.nist.gov/rest/json/cves/2.0?keywordSearch=${convertedName}&resultsPerPage=5`,
          { headers: { apiKey: NVD_API_KEY } }
        );
        const information = await NVD_Data.json();
        const vulnerabilities = filterRecentVulnerabilities(
          information.vulnerabilities
        );

        return {
          tech: row.tech_name,
          details: { ...information, vulnerabilities },
        };
      } catch (err) {
        console.log(`Failed fetching NVD data for ${row.tech_name}:`, err);
        return {
          tech: row.tech_name,
          details: { vulnerabilities: [] },
        };
      }
    });

    const user_watch_list = await Promise.all(fetchPromises);

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
