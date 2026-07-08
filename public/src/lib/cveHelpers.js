const SEVERITY_RANK = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
  unknown: 0,
};

export function getCvssScore(cveData) {
  return (
    cveData?.metrics?.cvssMetricV31?.[0]?.cvssData?.baseScore ??
    cveData?.metrics?.cvssMetricV30?.[0]?.cvssData?.baseScore ??
    cveData?.metrics?.cvssMetricV2?.[0]?.cvssData?.baseScore ??
    null
  );
}

export function getSeverityFromScore(score) {
  if (score == null || score <= 0) return "unknown";
  if (score >= 9) return "critical";
  if (score >= 7) return "high";
  if (score >= 4) return "medium";
  return "low";
}

export function getCveSeverity(cve) {
  const cveData = cve?.cve || cve;
  return getSeverityFromScore(getCvssScore(cveData));
}

export function getHighestSeverity(severities) {
  return severities.reduce((highest, severity) => {
    if (!highest) return severity;
    return SEVERITY_RANK[severity] > SEVERITY_RANK[highest] ? severity : highest;
  }, null);
}

export function summarizeWatchlist(watchlist) {
  const severities = [];

  const advisories = watchlist.reduce((sum, item) => {
    if (item.details?.loading) return sum;

    const vulnerabilities = item.details?.vulnerabilities ?? [];
    vulnerabilities.forEach((entry) => {
      severities.push(getCveSeverity(entry));
    });

    return sum + vulnerabilities.length;
  }, 0);

  return {
    technologies: watchlist.length,
    advisories,
    highestSeverity: getHighestSeverity(severities),
  };
}
