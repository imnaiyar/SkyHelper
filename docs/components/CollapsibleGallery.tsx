import React, { useState } from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { IoIosArrowDropdownCircle } from "react-icons/io";

/**
 * Returns a jsx component for a collapsible text that shows provided images gallery
 * @param options Options for the collapsible gallery
 */
const CollapsibleGallery = ({ headingText, images }: CollapsibleGalleryOptions) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <p onClick={toggleOpen} style={styles.toggle}>
        {headingText}{" "}
        <span style={{ ...styles.icon, transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
          {<IoIosArrowDropdownCircle />}
        </span>
      </p>
      {isOpen && (
        <div style={styles.galleryContainer}>
          <Carousel autoPlay width="400px" showThumbs={false}>
            {images.map((image, index) => (
              <div key={index}>
                <img src={image.src} alt={image.alt || `Image ${index + 1}`} />
                {image.caption && <p className="legend">{image.caption}</p>}
              </div>
            ))}
          </Carousel>
        </div>
      )}
    </>
  );
};

const styles = {
  toggle: {
    fontWeight: "bold",
    cursor: "pointer",
  },
  icon: {
    display: "inline-block",
    transition: "transform 0.3s ease",
  },
  galleryContainer: {
    padding: "10px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
};

export default CollapsibleGallery;

interface CollapsibleGalleryOptions {
  /**
   * The text to display for collapsible gallery
   */
  headingText: string;

  /**
   * The images to include in the gallery
   */
  images: { src: string; alt: string; caption: string }[];
}
