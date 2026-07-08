const TECH_DISPLAY_NAMES = {
  nodejs: "node.js",
  node: "node.js",
  "node.js": "node.js",
};

export function normalizeTechName(techName) {
  const key = (techName || "").trim().toLowerCase();
  return TECH_DISPLAY_NAMES[key] || key;
}

export function formatTechDisplayName(techName) {
  return normalizeTechName(techName);
}
