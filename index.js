const express = require("express");
const path = require("path");
const supabaseClient = require("@supabase/supabase-js");
const dotenv = require("dotenv");

const app = express();
const port = 3000;

dotenv.config({ path: "./.env" });

app.use(express.static("public"));
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const NVD_API_KEY = process.env.NVD_API_KEY;

const supabase = supabaseClient.createClient(supabaseUrl, supabaseKey);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "src", "index.html"));
});

// ENDPOINT 1: To get the watchlist of the user from the database
// Call this endpoint to get the user's watchlist of all of the technologies they are using.
app.get("/api/watchlist", async (req, res) => {
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
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Server Failed" });
  }
});

// ENDPOINT 2: Update the watchlist on the database
// Call this endpoint to update the user's watchlist on supabase and the frontend.
app.post("/api/watchlist", async (req, res) => {
  try {
    const userId = req.body.user_id;
    const cleanTechName = req.body.tech_name.trim().toLowerCase();

    // Checks if the count of a user's watchlist is greater than 5
    const { count, error } = await supabase
      .from("watchlist")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);
    //npm run server is no longer working and I think it's because we have created a variable error HERE while also making one on line 64, thus giving me an error.
    if (error) {
      console.log(error);
      return res.status(400).json({ error: error.message });
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
    res.status(500).json({ message: "Server Failed" });
  }
});

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

    let user_watch_list = [];

    for (const row of data) {
      const convertedName = encodeURIComponent(row.tech_name);
      const NVD_Data = await fetch(
        `https://services.nvd.nist.gov/rest/json/cves/2.0?keywordSearch=${convertedName}`,
        {
          headers: {
            apiKey: NVD_API_KEY,
          },
        }
      );
      const information = await NVD_Data.json();

      user_watch_list.push({
        tech: row.tech_name,
        details: information,
      });
    }
    res.json(user_watch_list);
  } catch (error) {
    res.status(500).json({ message: "Server Failed" });
  }
});

// ENDPOINT 4: Removes a tech from the database
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
