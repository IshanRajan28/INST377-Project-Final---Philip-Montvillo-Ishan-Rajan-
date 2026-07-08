import {
  getCvssScore,
  getSeverityFromScore,
} from "../lib/cveHelpers";

function formatPublishedDate(isoString) {
  if (!isoString || typeof isoString !== "string") {
    return "Unknown publish date";
  }

  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return "Unknown publish date";
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function CveCard({ cve }) {
  const cveData = cve?.cve || cve;
  const cveId = cveData?.id || "Unknown CVE";
  const nvdUrl =
    cveId !== "Unknown CVE"
      ? `https://nvd.nist.gov/vuln/detail/${cveId}`
      : null;

  const description =
    cveData?.descriptions?.find((item) => item.lang === "en")?.value ||
    "No description available.";

  const publishedDate = formatPublishedDate(cveData?.published);

  const score = getCvssScore(cveData);
  const severity = getSeverityFromScore(score);
  const scoreLabel = score != null ? score.toFixed(1) : "N/A";

  return (
    <article className={`cveCard ${severity}`}>
      <div className="cveCardHeader">
        <h4 className="cveCardId">
          {nvdUrl ? (
            <a
              href={nvdUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cve-link"
            >
              {cveId}
            </a>
          ) : (
            cveId
          )}
        </h4>
        <span
          className={`severityBadge ${severity}`}
          aria-label={`Severity: ${severity}, score ${scoreLabel}`}
        >
          {severity.toUpperCase()} {scoreLabel}
        </span>
      </div>

      <p className="cveDescription">{description}</p>

      <footer className="cveCardFooter">
        <small className="cvePublished">Published · {publishedDate}</small>
        {nvdUrl && (
          <span className="cveCardSource">NIST NVD</span>
        )}
      </footer>
    </article>
  );
}

export default CveCard;
