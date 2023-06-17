import React, { useEffect, useState } from "react";
import { useCollection } from "../../hooks/useCollection";
import { useAuthContext } from "../../hooks/useAuthContext";

// styles
import styles from "./Home.module.css";

export default function OverallSalesMetrics() {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [totalCosts, setTotalCosts] = useState(0);

  const { user } = useAuthContext();
  const { documents: restocks, error: restocksError } = useCollection(
    `users/${user?.uid}/restocks`
  );
  const { documents: sales, error: salesError } = useCollection(
    `users/${user?.uid}/sales`
  );

  useEffect(() => {
    if (restocksError || salesError) {
      console.log("Error retrieving data");
    } else if (restocks && sales) {
      const revenue = calculateTotalRevenue(sales);
      const profit = calculateTotalProfit(sales, restocks);
      const costs = calculateTotalCosts(restocks);
      setTotalRevenue(revenue);
      setTotalProfit(profit);
      setTotalCosts(costs);
    }
  }, [restocks, sales, restocksError, salesError]);

  const calculateTotalRevenue = (sales) => {
    return sales.reduce(
      (total, sale) => total + (sale.transactionAmount || 0),
      0
    );
  };

  const calculateTotalProfit = (sales, restocks) => {
    const salesAmount = calculateTotalRevenue(sales);
    const restocksCost = calculateTotalCosts(restocks);
    return salesAmount - restocksCost;
  };

  const calculateTotalCosts = (restocks) => {
    return restocks.reduce(
      (total, restock) => total + (restock.transactionAmount || 0),
      0
    );
  };

  return (
    <div className={styles.metricsContainer}>
      <h3>Overall Sales Metrics</h3>
      <div className={styles.metrics}>
        <p>Total Revenue: ${totalRevenue}</p>
        <p>Total Profit: ${totalProfit}</p>
        <p>Total Costs: ${totalCosts}</p>
      </div>
    </div>
  );
}
