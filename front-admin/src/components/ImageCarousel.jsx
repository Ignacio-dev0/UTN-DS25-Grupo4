import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../styles/AdminDashboard.css"; // para que herede el estilo

const ImageCarousel = ({ images }) => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  return (
    <Slider {...settings} className="carousel">
      {images.map((img, index) => (
        <div key={index} className="carousel-image-wrapper">
          <img src={img} alt={`Foto ${index + 1}`} className="carousel-image" />
        </div>
      ))}
    </Slider>
  );
};

export default ImageCarousel;
