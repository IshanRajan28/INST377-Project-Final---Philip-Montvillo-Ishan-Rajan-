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

    // Checks if the technology has relevant CVEs in NVD (CPE + filtered keyword)
    try {
      const { items, fetchError } = await fetchNvdForTech(cleanTechName);

      if (fetchError || items.length === 0) {
        return res.status(400).json({
          error: `"${req.body.tech_name}" has no matching CVEs in NVD. Try a specific product name (e.g. nodejs, python, react).`,
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
const NVD_REQUEST_DELAY_MS = 700;
const NVD_CACHE_TTL_MS = 5 * 60 * 1000;
const nvdCache = new Map();

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

// Prefer CPE-based NVD queries so watchlist results match the actual product
const NVD_TECH_CONFIG = {
  nodejs: {
    cpeName: "cpe:2.3:a:nodejs:node.js:*:*:*:*:*:*:*:*",
    cpePatterns: [":nodejs:", ":node.js:"],
    keywordFallback: "nodejs",
  },
  python: {
    cpeName: "cpe:2.3:a:python:python:*:*:*:*:*:*:*:*",
    cpePatterns: [":python:python", ":python:cpython"],
    keywordFallback: "python",
  },
  react: {
    cpeName: "cpe:2.3:a:facebook:react:*:*:*:*:*:*:*:*",
    cpePatterns: [":facebook:react", ":react:"],
    keywordFallback: "react",
  },
  java: {
    cpeName: "cpe:2.3:a:oracle:jdk:*:*:*:*:*:*:*:*",
    cpePatterns: [
      ":oracle:jdk",
      ":oracle:java",
      ":oracle:jre",
      ":sun:jdk",
      ":sun:jre",
      ":ibm:java",
    ],
    keywordFallback: "oracle jdk",
  },
};

function nvdHeaders() {
  return NVD_API_KEY ? { apiKey: NVD_API_KEY } : {};
}

function collectCpeCriteria(cve) {
  const criteria = [];
  const configurations = cve?.configurations || [];

  for (const config of configurations) {
    for (const node of config.nodes || []) {
      for (const match of node.cpeMatch || []) {
        if (match.criteria) criteria.push(match.criteria.toLowerCase());
      }
      for (const child of node.children || []) {
        for (const match of child.cpeMatch || []) {
          if (match.criteria) criteria.push(match.criteria.toLowerCase());
        }
      }
    }
  }

  return criteria;
}

function matchesCpePatterns(cpeCriteria, patterns) {
  return patterns.some((pattern) =>
    cpeCriteria.some((cpe) => cpe.includes(pattern.toLowerCase()))
  );
}

const NODEJS_FALSE_POSITIVE =
  /\btabby\b|terminus|terminal emulator|electron app|vscode|visual studio code|alacritty|wezterm|iterm|hyper terminal|desktop application|web browser/i;

function isRelevantNodejsCve(cve) {
  const desc = (
    cve.descriptions?.find((d) => d.lang === "en")?.value || ""
  ).toLowerCase();
  const cpeCriteria = collectCpeCriteria(cve);
  const cpeText = cpeCriteria.join(" ");
  const haystack = `${cve.id || ""} ${desc} ${cpeText}`.toLowerCase();

  if (NODEJS_FALSE_POSITIVE.test(haystack)) {
    return false;
  }

  const strictNodeCpe = cpeCriteria.some(
    (cpe) => cpe.includes(":nodejs:node.js:") || cpe.includes(":nodejs:node:")
  );
  if (strictNodeCpe) {
    return true;
  }

  const nodeInDescription =
    /\bnode\.?js\b|\bnodejs\b|snowflake-connector-nodejs|-nodejs\b/.test(desc);
  const nodeEcosystemContext =
    /\b(runtime|npm|package|module|driver|sdk|connector|library|framework)\b/.test(
      desc
    );

  return nodeInDescription && nodeEcosystemContext;
}

function isRelevantCve(keyword, entry) {
  const config = NVD_TECH_CONFIG[keyword];
  if (!config) return true;

  const cve = entry?.cve;
  if (!cve) return false;

  if (keyword === "nodejs") {
    return isRelevantNodejsCve(cve);
  }

  const cpeCriteria = collectCpeCriteria(cve);
  if (
    cpeCriteria.length > 0 &&
    matchesCpePatterns(cpeCriteria, config.cpePatterns)
  ) {
    return true;
  }

  const desc = (
    cve.descriptions?.find((d) => d.lang === "en")?.value || ""
  ).toLowerCase();

  const descPatterns = {
    python: /\bpython\b(?!\.org)/,
    react: /\breact(\.js)?\b.*\b(npm|package|library|component|framework)\b|\breact\.js\b/,
    java: /\b(java|jdk|jre|jvm|openjdk)\b/,
  };

  return descPatterns[keyword]?.test(desc) ?? false;
}

function filterRelevantVulnerabilities(keyword, vulnerabilities) {
  if (!vulnerabilities?.length) return [];
  return vulnerabilities.filter((entry) => isRelevantCve(keyword, entry));
}

function dedupeVulnerabilities(vulnerabilities) {
  const seen = new Set();
  return (vulnerabilities || []).filter((entry) => {
    const id = entry?.cve?.id;
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

function isRateLimitResponse(response, data) {
  if (response.status === 429 || response.status === 503) return true;
  const msg = (data?.message || "").toLowerCase();
  return msg.includes("rate limit") || msg.includes("too many requests");
}

async function requestNvd(url, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, { headers: nvdHeaders() });
      const data = await response.json();

      if (response.ok && Array.isArray(data.vulnerabilities)) {
        return { vulnerabilities: data.vulnerabilities, error: false };
      }

      if (isRateLimitResponse(response, data) && attempt < retries) {
        await delay(1200 * (attempt + 1));
        continue;
      }

      console.log("NVD request failed:", response.status, data?.message || data);
      return { vulnerabilities: [], error: true, message: data?.message };
    } catch (err) {
      if (attempt < retries) {
        await delay(1200 * (attempt + 1));
        continue;
      }
      console.log("NVD network error:", err.message);
      return { vulnerabilities: [], error: true };
    }
  }

  return { vulnerabilities: [], error: true };
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
  const cacheKey = keyword;
  const cached = nvdCache.get(cacheKey);
  if (cached && Date.now() - cached.time < NVD_CACHE_TTL_MS) {
    return cached.data;
  }

  const config = NVD_TECH_CONFIG[keyword];
  let rawVulnerabilities = [];
  let keywordFailed = false;

  if (config?.cpeName) {
    const cpeUrl =
      `https://services.nvd.nist.gov/rest/json/cves/2.0?cpeName=${encodeURIComponent(config.cpeName)}` +
      `&resultsPerPage=${NVD_RESULTS_PAGE}`;
    const cpeResult = await requestNvd(cpeUrl);
    if (!cpeResult.error) {
      rawVulnerabilities = cpeResult.vulnerabilities;
    }
  }

  const relevantFromCpe = filterRelevantVulnerabilities(
    keyword,
    rawVulnerabilities
  );
  if (relevantFromCpe.length >= CVE_LIMIT) {
    const result = sortAndLimitVulnerabilities(relevantFromCpe);
    const payload = {
      items: result.items,
      showingHistorical: result.showingHistorical,
      fetchError: false,
      noRelevantResults: false,
    };
    nvdCache.set(cacheKey, { time: Date.now(), data: payload });
    return payload;
  }

  await delay(NVD_REQUEST_DELAY_MS);

  const searchTerm = config?.keywordFallback || keyword;
  const keywordUrl =
    `https://services.nvd.nist.gov/rest/json/cves/2.0?keywordSearch=${encodeURIComponent(searchTerm)}` +
    `&resultsPerPage=${NVD_RESULTS_PAGE}`;
  const keywordResult = await requestNvd(keywordUrl);

  if (!keywordResult.error) {
    rawVulnerabilities = dedupeVulnerabilities([
      ...rawVulnerabilities,
      ...keywordResult.vulnerabilities,
    ]);
  } else if (relevantFromCpe.length === 0) {
    keywordFailed = true;
  }

  const relevant = filterRelevantVulnerabilities(keyword, rawVulnerabilities);
  const result = sortAndLimitVulnerabilities(relevant);

  const payload = {
    items: result.items,
    showingHistorical: result.showingHistorical,
    fetchError: keywordFailed && result.items.length === 0,
    noRelevantResults:
      !keywordFailed && result.items.length === 0 && rawVulnerabilities.length > 0,
  };

  if (payload.items.length > 0) {
    nvdCache.set(cacheKey, { time: Date.now(), data: payload });
  }

  return payload;
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
        const { items, showingHistorical, fetchError, noRelevantResults } =
          await fetchNvdForTech(row.tech_name);

        user_watch_list.push({
          tech: row.tech_name,
          details: {
            vulnerabilities: items,
            showingHistorical,
            fetchError,
            noRelevantResults,
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
