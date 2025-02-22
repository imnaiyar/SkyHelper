import React, { useState, useRef, useEffect } from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { IoIosArrowDropdownCircle } from "react-icons/io";

/**
 * Returns a JSX component for a collapsible text that shows a provided images gallery
 * @param options Options for the collapsible gallery
 */
const CollapsibleGallery = ({ headingText, images }: CollapsibleGalleryOptions) => {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef(null); // Reference to the collapsible content
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen]);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <p onClick={toggleOpen} style={styles.toggle}>
        {headingText}{" "}
        <span style={{ ...styles.icon, transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
          <IoIosArrowDropdownCircle />
        </span>
      </p>
      <div
        ref={contentRef}
        style={{
          ...styles.collapsibleContent,
          maxHeight: `${contentHeight}px`,
        }}
      >
        <div style={styles.galleryContainer}>
          <Carousel width="400px" showThumbs={false}>
            {images.map((image, index) => (
              <div key={index}>
                <img src={image.src} alt={image.alt || `Image ${index + 1}`} />
                {image.caption && <p className="legend">{image.caption}</p>}
              </div>
            ))}
          </Carousel>
        </div>
      </div>
    </>
  );
};

const styles = {
  toggle: {
    fontWeight: "bold",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  },
  icon: {
    display: "inline-block",
    transition: "transform 0.3s ease",
    marginLeft: "8px",
  },
  collapsibleContent: {
    overflow: "hidden",
    transition: "max-height 0.5s ease",
  },
  galleryContainer: {
    padding: "10px",
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
