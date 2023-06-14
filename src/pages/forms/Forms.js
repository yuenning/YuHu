import React, { useState } from "react";

// components
import RestockProductForm from "./RestockProductForm";
import SalesProductForm from "./SalesProductForm";

// styles
import styles from "./Forms.module.css";

export default function Forms() {
  const SwitchButton = () => {
    const [isSalesForm, setSalesForm] = useState(true);

    const handleClick = () => {
      setSalesForm(!isSalesForm);
    };

    return (
      <div className={styles.container}>
        <label className={styles.toggleSwitch}>
          <input type="checkbox" checked={isSalesForm} onChange={handleClick} />
          <span className={styles.slider}></span>
          {/* Labels for debugging purposes */}
          {/*<span className={styles.sliderLabel}>
            {isSalesForm ? "Sales Form" : "Restock Form"}
          </span>*/}
        </label>
        <br></br>
        <div className={styles.sidebar}>
          {isSalesForm ? <SalesProductForm /> : <RestockProductForm />}
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
