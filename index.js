const express = require("express");
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

app.get('/', (req, res) => {
  res.sendFile('public/index.html', { root: __dirname });
});

// ENDPOINT 1: To get the watchlist of the user from the database
// Call this endpoint to get the user's watchlist of all of the technologies they are using.
app.get("/api/watchlist", async (req, res) => {
  try {
    const { data, error } = await supabase.from("watchlist").select("*");
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
    const { data, error } = await supabase
      .from("watchlist")
      .insert({
        tech_name: req.body.tech_name,
        user_id: req.body.user_id,
      })
      .select("*");
    // .insert.select only show the new row and hence made it easier for you Phillp
    if (error) {
      console.log(error);
      return res.status(400).json({ error: error.message });
    }
    res.json(data[0]);
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ message: "Server Failed" });
  }
});

// ENDPOINT 3: GET Data from the NVD api
// Borrows the logic from ENDPOINT 1 and 2
app.get("/api/vulnerabilities", async (req, res) => {
  try {
    const { data, error } = await supabase.from("watchlist").select("*");
    if (error) {
      console.log(error);
      return res.status(400).json({ error: error.message });
    }

    let user_watch_list = [];

    for (const row of data) {
      const convertedName = encodeURIComponent(row.tech_name);
      const NVD_Data = await fetch(
        `https://services.nvd.nist.gov/rest/json/cves/2.0?keywordSearch=${convertedName}`
      );
      const information = await NVD_Data.json();
      user_watch_list.push(information);
    }
    res.json(user_watch_list);
  } catch (error) {
    res.status(500).json({ message: "Server Failed" });
  }
});

app.listen(port, () => {
  console.log(`App is available on port: ${port}`);
});
