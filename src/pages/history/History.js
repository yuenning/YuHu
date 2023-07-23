import React, { useState } from "react";

// styles
import styles from "./History.module.css";

// components
import RestockList from "./RestockList";
import SalesList from "./SalesList";

export default function Home() {
  const SwitchButton = () => {
    const [isRestockList, setRestockList] = useState(true);

    const handleClickRestock = () => {
      setRestockList(true);
    };

    const handleClickSales = () => {
      setRestockList(false);
    };

    return (
      <div className={styles.container}>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <div className={styles.toggleButton}>
          <div
            className={`${styles.toggleOption} ${
              isRestockList ? styles.active : ""
            }`}
            onClick={handleClickRestock}
          >
            Restock
          </div>
          <div
            className={`${styles.toggleOption} ${
              !isRestockList ? styles.active : ""
            }`}
            onClick={handleClickSales}
          >
            Sales
          </div>
        </div>
        <br />
        <div className={styles.sidebar}>
          {isRestockList ? <RestockList /> : <SalesList />}
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
