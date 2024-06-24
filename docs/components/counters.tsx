import { useState } from "react";
import styles from "./counters.module.css";
import bttn from "./button.css";

function MyButton() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(count + 1);
  }

  return (
    <div>
      <button onClick={handleClick} className={`${bttn.button_top} ${styles.counter}`}>
        Clicked {count} times
      </button>
    </div>
  );
}

export function Counter() {
  return <MyButton />;
}