import { useState, useEffect } from "react";
import bttn from "./button.module.css";
import { useTheme } from "nextra-theme-docs";
function MyButton() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(count + 1);
  }

  const { theme } = useTheme();

  useEffect(() => {
    document.documentElement.style.setProperty("--button_outline_color", theme === "dark" ? "#983636" : "#000000");
  }, [theme]);

  return (
    <div className={bttn.container}>
      <button onClick={handleClick} className={bttn.button}>
        <span className={bttn.button_top}>Clicked {count} times</span>
      </button>
    </div>
  );
}

export function Counter() {
  return <MyButton />;
}
