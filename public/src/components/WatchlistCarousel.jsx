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

function WatchlistCarousel({ watchlist }) {
  if (!watchlist || watchlist.length === 0) {
    return (
      <div className="empty-state">
        <p>Your watchlist is empty.</p>
        <p className="empty-state-hint">
          Add a technology on the left to see CVEs from the NVD database.
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

            {vulnerabilities.length === 0 ? (
              <p className="empty-state-hint">
                No recent CVEs found for {displayName}. Try another keyword.
              </p>
            ) : (
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
            )}
          </div>
        );
      })}
    </div>
  );
}

export default WatchlistCarousel;
