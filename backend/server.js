const express = require("express");
const supabaseClient = require("@supabase/supabase-js");
const dotnev = require("dotenv");

const app = express();
const port = 3000;
dotnev.config();

app.use(express.static("frontend/build"));
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const NVD_API_KEY = process.env.NVD_API_KEY;

const supabase = supabaseClient.createClient(supabaseUrl, supabaseKey);

// ENDPOINT 1: To get the watchlist of the user from the database
app.get("/api/watchlist", async (req, res) => {});

// ENDPOINT 2: Update the watchlist on the database
app.post("/api/watchlist", async (req, res) => {});

// ENDPOINT 3: GET Data from the NVD api
app.get("/api/vulnerabilities", async (req, res) => {});
