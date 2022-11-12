import { useEffect, useRef } from "react";
import Carousel from "react-elastic-carousel";

export default function CarouselComponent(props) {
  const { initData } = props;
  const playSpeed = props.playSpeed ?? 1500;
  const autoPlay = props.autoPlay ?? true;
  const itemsToShow = props.itemsToShow ?? 1;

  if (initData.length < 1) throw new Error("CarouselComponent: initData is empty");

  const carousel = useRef();
  const lastImageIndex = initData.length - 1;

  useEffect(() => {
    if (autoPlay == false) {
      return;
    }

    const autoLoop = setInterval(() => {
      if (carousel.current.state.activePage === lastImageIndex) {
        carousel.current.goTo(0);
      } else {
        carousel.current.slideNext();
      }
    }, playSpeed); // Your custom auto loop delay in ms

    return () => clearInterval(autoLoop);
  }, []);

  return (
    <Carousel className="carousel-box" pagination={false} showArrows={false} itemsToShow={itemsToShow} ref={carousel}>
      {initData.map((item) => (
        <div key={item.id}>
          <img className="carousel-image" alt={item.name} src={item.fileUrl} />
        </div>
      ))}
    </Carousel>
  );
}
