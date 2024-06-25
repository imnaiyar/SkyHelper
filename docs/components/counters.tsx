import { useState } from "react";
import styles from "./counters.module.css";
import bttn from "./button.module.css";

function MyButton() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(count + 1);
  }

  return (
    <div>
      <button onClick={handleClick} className={bttn.button}>
        <span className={bttn.button_top}>Clicked {count} times</span>
      </button>
    </div>
  );
}

export function Counter() {
  return <MyButton />;
}