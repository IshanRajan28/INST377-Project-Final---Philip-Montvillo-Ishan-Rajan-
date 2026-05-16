import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import CveCard from "./CveCard";

import "swiper/css";
import "swiper/css/navigation";

function WatchlistCarousel({ watchlist }) {
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
            </div>

            <Swiper
              modules={[Navigation]}
              navigation
              spaceBetween={20}
              slidesPerView="auto"
              >

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
