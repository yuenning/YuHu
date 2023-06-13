import React, { useState } from "react";

// components
import RestockForm from "./RestockForm";
import SalesForm from "./SalesForm";

// styles
import styles from "./Forms.module.css";

export default function Forms() {
  const SwitchButton = () => {
    const [isPage1Visible, setPage1Visible] = useState(true);

    const handleClick = () => {
      setPage1Visible(!isPage1Visible);
    };

    return (
      <div className={styles.container}>
        <label className={styles.toggleSwitch}>
          <input
            type="checkbox"
            checked={isPage1Visible}
            onChange={handleClick}
          />
          <span className={styles.slider}></span>
          <span className={styles.sliderLabel}>
            {isPage1Visible ? "Restock Form" : "Sales Form"}
          </span>
        </label>
        <br></br>
        <div className={styles.content}>
          {isPage1Visible ? (
            <RestockForm className={styles.RestockForm} />
          ) : (
            <SalesForm className={styles.SalesForm} />
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <SwitchButton />
    </div>
  );
}
