function CveCard({ cve, techName }) {
  // If cve.cve exists, use it; otherwise just use cve.
  const cveData = cve?.cve || cve;

  // Use the CVE ID if it exists. If not, display unknown.
  const cveId = cveData?.id || "Unknown CVE :(";

  // Find the English description if it exists. If not, display a fallback message.
  const description =
    cveData?.descriptions?.find((item) => item.lang === "en")?.value ||
    "No description available.";

  // Format the published date with toLocaleDateString() if it exists. Otherwise, display unknown.
  const publishedDate = cveData?.published
    ? new Date(cveData.published).toLocaleDateString()
    : "Unknown publish date";

  // Let's try to find the CVSS score from the NVD metrics.
  // Some CVEs use CVSS v3.1, some use v3.0, and some use v2.
  const score =
    cveData?.metrics?.cvssMetricV31?.[0]?.cvssData?.baseScore ||
    cveData?.metrics?.cvssMetricV30?.[0]?.cvssData?.baseScore ||
    cveData?.metrics?.cvssMetricV2?.[0]?.cvssData?.baseScore ||
    null;

  // Start the severity as unknown in case there is no CVSS score.
  let severity = "unknown";

  // Convert the numeric CVSS score into a severity label.
  if (score >= 9) {
    severity = "critical";
  } else if (score >= 7) {
    severity = "high";
  } else if (score >= 4) {
    severity = "medium";
  } else if (score > 0) {
    severity = "low";
  }

  return (
    <article className={`cveCard ${severity}`}>
      <span className="techLabel">{techName}</span>
      <div className="cveCardHeader">
        <h3>{cveId}</h3>

        {/* Display the severity label and score inside a styled badge. */}
        <span className={`severityBadge ${severity}`}>
          {severity.toUpperCase()} {score || "N/A"}
        </span>
      </div>

      {/* Display the CVE description. */}
      <p>{description}</p>

      {/* Display the formatted publish date. */}
      <small>Published: {publishedDate}</small>
    </article>
  );
}

export default CveCard;
