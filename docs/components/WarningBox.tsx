import React from "react";
import { useTheme } from "nextra-theme-docs";
const WarningBox = ({ children }) => {
  const { theme } = useTheme();

  const boxStyle = {
    padding: "10px",
    borderLeft: "4px solid #ff9800",
    backgroundColor: theme === "dark" ? "#3f1f00" : "#fff3e0",
    color: theme === "dark" ? "#f0f0f0" : "#000000",
    marginBottom: "16px",
    borderRadius: "4px",
  };

  return <div style={boxStyle}>{children}</div>;
};

export { WarningBox };
