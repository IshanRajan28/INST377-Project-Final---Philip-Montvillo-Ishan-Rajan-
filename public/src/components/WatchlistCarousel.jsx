import { Swiper, SwiperSlide } from "swiper/react";
import CveCard from "./CveCard";

import "swiper/css";
import "swiper/css/navigation";

function WatchlistCarousel({ watchlist, deleteTech }) {
  if (!watchlist || watchlist.length === 0) {
    return <p>Your watchlist is empty.</p>;
  }

  return (
    <div>
      {watchlist?.map((item, index) => {
        const displayName = item?.tech || item?.tech_name;

        return (
          <div key={item.id || displayName || index} className="techRow">
            <div className="techRowHeader">
              <h2>{displayName}</h2>
              <button onClick={() => deleteTech(displayName)}>
                Stop Tracking
              </button>
            </div>

            <Swiper >
              {item?.details?.vulnerabilities?.map((bug, bugIndex) => {
                const cveData = bug.cve || bug;

                return (
                  <SwiperSlide key={cveData?.id || bugIndex}>
                    <CveCard cve={cveData} techName={displayName} />
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        );
      })}
    </div>
  );
}

export default WatchlistCarousel;
