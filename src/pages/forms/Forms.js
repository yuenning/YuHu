import React, { useState } from "react";

// components
import RestockForm from "./RestockForm";
import SalesForm from "./SalesForm";
import NewSalesForm from "./NewSalesForm";

// styles
import styles from "./Forms.module.css";

export default function Forms() {
  const SwitchButton = () => {
    const [isRestockForm, setRestockForm] = useState(true);

    const handleClickRestock = () => {
      setRestockForm(true);
    };

    const handleClickSales = () => {
      setRestockForm(false);
    };

    return (
      <div className={styles.container}>
        <div className={styles.toggleButton}>
          <div
            className={`${styles.toggleOption} ${
              isRestockForm ? styles.active : ""
            }`}
            onClick={handleClickRestock}
          >
            Restock
          </div>
          <div
            className={`${styles.toggleOption} ${
              !isRestockForm ? styles.active : ""
            }`}
            onClick={handleClickSales}
          >
            Sales
          </div>
        </div>
        <br />
        <div className={styles.sidebar}>
          {isRestockForm ? <RestockForm /> : <NewSalesForm />}
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
