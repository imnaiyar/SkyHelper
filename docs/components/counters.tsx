import { useState, useEffect } from "react";
import bttn from "./button.module.css";
import { useTheme } from "nextra-theme-docs";
function MyButton() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(count + 1);
  }

  const { resolvedTheme } = useTheme();
  useEffect(() => {
    document.documentElement.style.setProperty("--button_outline_color", resolvedTheme === "dark" ? "#983636" : "#000000");
  }, [resolvedTheme]);

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
