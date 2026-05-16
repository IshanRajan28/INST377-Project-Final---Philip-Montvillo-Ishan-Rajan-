import { Swiper, SwiperSlide } from "swiper/react";
import CveCard from "./CveCard";

import "swiper/css";

function WatchlistCarousel({ watchlist, deleteTech }) {
  if (!watchlist || watchlist.length === 0) {
    return <p>Your watchlist is empty.</p>;
  }

  return (
    <div>
      {watchlist.map((item) => (
        <div key={item.id} className="techRow">
          <div className="techRowHeader">
            <h2>{item.tech_name}</h2>
            <button onClick={() => deleteTech(item.tech_name)}>
              Stop Tracking
            </button>
          </div>

          <Swiper spaceBetween={20} slidesPerView={3} grabCursor={true}>
            {item.vulnerabilities.map((bug) => (
              <SwiperSlide key={bug.id}>
                <CveCard cve={bug} techName={item.tech_name} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      ))}
    </div>
  );
}

export default WatchlistCarousel;
