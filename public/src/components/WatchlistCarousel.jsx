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

function WatchlistCarousel({ watchlist, isLoading = false }) {
  if (!watchlist || watchlist.length === 0) {
    if (isLoading) {
      return null;
    }
    return (
      <div className="empty-state">
        <p>No technologies on your watchlist yet</p>
        <p className="empty-state-hint">
          Add a stack item in the sidebar — try nodejs, python, or react — to
          load matching advisories.
        </p>
      </div>
    );
  }

  return (
    <div className="carousel-root">
      {watchlist.map((item, index) => {
        const displayName = item?.tech || item?.tech_name;
        const vulnerabilities = item?.details?.vulnerabilities ?? [];

        return (
          <div key={item.id || displayName || index} className="techRow">
            <div className="techRowHeader">
              <h3>{displayName}</h3>
            </div>

            {item.details?.loading ? (
              <p className="dashboard-loading tech-loading" role="status">
                Loading CVEs for {displayName}...
              </p>
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
              <>
              {item.details?.showingHistorical && (
                <p className="historical-notice" role="status">
                  No CVEs from the last 2 years for this keyword. Showing
                  older NVD results — try a more specific technology name.
                </p>
              )}
              <Swiper
                modules={[Navigation]}
                navigation
                breakpoints={SWIPER_BREAKPOINTS}
              >
                {vulnerabilities.map((bug, bugIndex) => {
                  const cveData = bug.cve || bug;

                  return (
                    <SwiperSlide key={cveData?.id || bugIndex}>
                      <CveCard cve={cveData} techName={displayName} />
                    </SwiperSlide>
                  );
                })}
              </Swiper>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default WatchlistCarousel;
