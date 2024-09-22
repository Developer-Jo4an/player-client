import React, {useEffect, useState} from "react";
import {Swiper, SwiperSlide} from "swiper/react";
import SwiperCore, {Autoplay, Pagination, Navigation} from "swiper";
import PropTypes from "prop-types";

SwiperCore.use([Autoplay, Pagination, Navigation]);

export default function Carousel({settings, prevRefNavigation, nextRefNavigation, item, itemsData, selectedSlide}) {

  const [swiper, setSwiper] = useState(null);

  // вшитые пропы, если не передан settings
  const innerSettings = {
    slidesPerView: "auto",
    centeredSlides: true
  };
  // подмена пропов на вшитые, если не пришли
  settings = settings ?? innerSettings;
  selectedSlide = selectedSlide ?? 0;

  //обновление настроек Swiper
  useEffect(() => {
    if (swiper) {
      Object.entries(settings).forEach(([key, value]) => {
        if (typeof swiper.params[key] !== "object")
          swiper.params[key] = value;
        else
          swiper.params[key] = {...swiper.params[key], ...value};
      });
      if (settings.breakpoints)
        swiper.currentBreakpoint = null;
      swiper.update();
    }
  }, [settings]);

  // работает с обновлением навигации пре смене рефов
  useEffect(() => {
    if (!swiper) return;
    const {navigation, navigation: {nextEl, prevEl}, params: {navigation: paramsNavigation}} = swiper;
    if (prevRefNavigation || nextRefNavigation) {
      (prevRefNavigation) ? paramsNavigation.prevEl = prevRefNavigation.current : null;
      (nextRefNavigation) ? paramsNavigation.nextEl = nextRefNavigation.current : null;
      if (nextEl || prevEl)
        navigation.destroy();
      navigation.init();
    }
  }, [prevRefNavigation, nextRefNavigation, swiper]);

  // работает с переданным в карусель слайдом
  useEffect(() => {
    if (!swiper) return;
    if (swiper.realIndex !== selectedSlide && selectedSlide !== null)
      swiper.slideTo(selectedSlide, swiper.speed);
  }, [selectedSlide]);


  // добавление on-метода к основым
  const addOnMethods = (callback, swiper) => {
    if (typeof callback === "function") {
      callback(swiper, swiper.realIndex, swiper.slides.length);
    }
    return null;
  };


  return (
    <div className={"carousel"}>
      <Swiper {...settings}
              onInit={swiper => {
                setSwiper(swiper);
                addOnMethods(settings.onInit, swiper);
              }}
              initialSlide={selectedSlide}
              onSlideChange={swiper => addOnMethods(settings.onSlideChange, swiper)}>
        {SwiperSlides(item, itemsData)}
      </Swiper>
    </div>
  );
}

function SwiperSlides(Item, itemsData) {
  return itemsData.map((data, index) => {
    return (
      <SwiperSlide key={data.key ?? index}>
        {
          (props) => (
            <Item
              {...data}
              {...props}
              index={index}
            />
          )
        }
      </SwiperSlide>
    );
  });

}


Carousel.propTypes = {
  /**
   * Настройки свайпера
   */
  settings: PropTypes.object,
  /**
   * Реф на кнопку 'prev'
   */
  prevRefNavigation: PropTypes.object,
  /**
   * Реф на кнопку 'next'
   */
  nextRefNavigation: PropTypes.object,
  /**
   * Компонент внутрь слайда
   */
  item: PropTypes
    .oneOfType([
      PropTypes.func, PropTypes.object
    ]),
  /**
   * Данные для слайдов
   */
  itemsData: PropTypes.array,
  /**
   * Выбранный слайд
   */
  selectedSlide: PropTypes.number
};
