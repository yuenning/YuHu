import styles from "./Introduction.module.css";
import React from "react";

export default function Introduction() {
  return (
    <div className={styles["introduction"]}>
      <h1>Successfully loaded website!</h1>
    </div>
  );
}
