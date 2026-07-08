export const NODE_JS_DISPLAY = "node.js";

const TECH_DISPLAY_NAMES = {
  nodejs: NODE_JS_DISPLAY,
  node: NODE_JS_DISPLAY,
  "node.js": NODE_JS_DISPLAY,
};

export const QUICK_TECH_EXAMPLES = [NODE_JS_DISPLAY, "python", "react"];

export const QUICK_TECH_HINT = QUICK_TECH_EXAMPLES.join(", ");

export const QUICK_TECH_OR_HINT =
  QUICK_TECH_EXAMPLES.length > 1
    ? `${QUICK_TECH_EXAMPLES.slice(0, -1).join(", ")}, or ${QUICK_TECH_EXAMPLES.at(-1)}`
    : QUICK_TECH_EXAMPLES[0] || "";

export function normalizeTechName(techName) {
  const key = (techName || "").trim().toLowerCase();
  return TECH_DISPLAY_NAMES[key] || key;
}

export function formatTechDisplayName(techName) {
  return normalizeTechName(techName);
}
