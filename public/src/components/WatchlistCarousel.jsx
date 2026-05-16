import { Swiper, SwiperSlide } from "swiper/react";
import CveCard from "./CveCard";

import "swiper/css";

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

            <Swiper spaceBetween={20} slidesPerView={3} grabCursor={true}>
              {item?.details?.vulnerabilities?.map((bug, bugIndex) => (
                <SwiperSlide key={bug.cve?.id || bugIndex}>
                  <CveCard cve={bug.cve || bug} techName={displayName} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        );
      })}
    </div>
  );
}

export default WatchlistCarousel;
