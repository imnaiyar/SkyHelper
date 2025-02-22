// Spoiler.js
import React, { useState } from "react";
import css from "./Spoiler.module.css";

const Spoiler = ({ children }) => {
  const [revealed, setRevealed] = useState(false);

  const toggleReveal = () => {
    setRevealed(!revealed);
  };

  return (
    <span className={`${css.spoiler} ${revealed ? `${css.revealed}` : ""}`} onClick={toggleReveal}>
      {children}
    </span>
  );
};

export default Spoiler;
