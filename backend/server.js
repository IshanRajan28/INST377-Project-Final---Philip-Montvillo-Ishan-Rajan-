const express = require("express");
const supabaseClient = require("@supabase/supabase-js");
const dotenv = require("dotenv");

const app = express();
const port = 3000;
app.listen(port);

dotenv.config({ path: "../.env" });

app.use(express.static("frontend/build"));
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const NVD_API_KEY = process.env.NVD_API_KEY;

const supabase = supabaseClient.createClient(supabaseUrl, supabaseKey);

// ENDPOINT 1: To get the watchlist of the user from the database
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
app.post("/api/watchlist", async (req, res) => {
  req.body;
});

// ENDPOINT 3: GET Data from the NVD api
app.get("/api/vulnerabilities", async (req, res) => {});
