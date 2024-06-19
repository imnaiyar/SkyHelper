import React from "react";
import { useTheme } from "nextra-theme-docs";
const InfoBox = ({ children }) => {
  const { theme } = useTheme();
  return (
    <div
      style={{
        padding: "10px",
        borderLeft: "4px solid #0070f3",
        backgroundColor: theme === "dark" ? "#001f3f" : "#e0f7fa",
        color: theme === "dark" ? "#f0f0f0" : "#000000",
        marginBottom: "16px",
        borderRadius: "4px",
      }}
    >
      {children}
    </div>
  );
};

export { InfoBox };
