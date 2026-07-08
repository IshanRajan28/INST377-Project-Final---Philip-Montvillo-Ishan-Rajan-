import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import CveCard from "./CveCard";

import "swiper/css";
import "swiper/css/navigation";

const SWIPER_BREAKPOINTS = {
  0: { slidesPerView: 1, spaceBetween: 12 },
  640: { slidesPerView: 2, spaceBetween: 16 },
  1024: { slidesPerView: 3, spaceBetween: 20 },
};

function WatchlistCarousel({ watchlist, isLoading = false, activeTech }) {
  if (!watchlist || watchlist.length === 0) {
    if (isLoading) {
      return null;
    }
    return (
      <div className="empty-state">
        <p>Add a technology to your stack</p>
        <p className="empty-state-hint">
          Use the sidebar to track something like nodejs, python, or react.
        </p>
      </div>
    );
  }

  return (
    <div className="carousel-root">
      {watchlist.map((item, index) => {
        const displayName = item?.tech || item?.tech_name;
        const vulnerabilities = item?.details?.vulnerabilities ?? [];
        const techKey = displayName?.toLowerCase();
        const isActive = activeTech === techKey;

        return (
          <div
            key={item.id || displayName || index}
            id={`tech-row-${techKey}`}
            className={`techRow${isActive ? " techRow--active" : ""}`}
            style={{ "--row-enter-delay": `${index * 0.08}s` }}
          >
            <span className="techRowRail" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="techRow-inner">
              <div className="techRowHeader">
                <div className="techRowHeader-main">
                  <h3>{displayName}</h3>
                  {item.details?.showingHistorical && (
                    <span
                      className="techRowTag techRowTag--historical"
                      title="No CVEs from the last 2 years for this keyword. Showing older NVD results."
                    >
                      Older results
                    </span>
                  )}
                </div>
                {!item.details?.loading && vulnerabilities.length > 0 && (
                  <span className="techRowMeta">
                    {vulnerabilities.length} CVE
                    {vulnerabilities.length === 1 ? "" : "s"}
                  </span>
                )}
              </div>

            {item.details?.loading ? (
              <div className="cve-skeleton-row" role="status" aria-live="polite">
                <span className="visually-hidden">
                  Loading CVEs for {displayName}
                </span>
                {[0, 1, 2].map((slot) => (
                  <div
                    key={slot}
                    className="cve-skeleton-card"
                    aria-hidden="true"
                  />
                ))}
              </div>
            ) : vulnerabilities.length === 0 ? (
              <div
                className={`cve-empty-notice${item.details?.fetchError ? " cve-empty-notice--error" : ""}`}
                role="status"
              >
                <p>
                {item.details?.fetchError
                  ? `Could not reach NVD for ${displayName}. Wait 30 seconds and refresh, or confirm NVD_API_KEY is set on the server.`
                  : item.details?.noRelevantResults
                    ? `NVD returned results for "${displayName}", but none matched this product after filtering. Try nodejs, python, or react.`
                    : `No CVEs found for ${displayName}. Try nodejs, python, react, or express.`}
                </p>
              </div>
            ) : (
              <Swiper
                modules={[Navigation]}
                navigation
                breakpoints={SWIPER_BREAKPOINTS}
              >
                {vulnerabilities.map((bug, bugIndex) => {
                  const cveData = bug.cve || bug;

                  return (
                    <SwiperSlide
                      key={cveData?.id || bugIndex}
                      className="cve-slide-enter"
                      style={{
                        "--cve-enter-delay": `${Math.min(bugIndex, 6) * 0.06}s`,
                      }}
                    >
                      <CveCard cve={cveData} />
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default WatchlistCarousel;
