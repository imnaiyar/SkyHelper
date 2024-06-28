import React from "react";
import { useTheme } from "nextra-theme-docs";
const WarningBox = ({ children }) => {
  const { resolvedTheme } = useTheme();

  const boxStyle = {
    padding: "10px",
    borderLeft: "4px solid #ff9800",
    backgroundColor: resolvedTheme === "dark" ? "#3f1f00" : "#fff3e0",
    color: resolvedTheme === "dark" ? "#f0f0f0" : "#000000",
    marginBottom: "16px",
    borderRadius: "4px",
  };

  return <div style={boxStyle}>{children}</div>;
};

export { WarningBox };
