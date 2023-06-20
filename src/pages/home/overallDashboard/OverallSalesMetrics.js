import React, { useEffect, useState } from "react";
import { useCollection } from "../../../hooks/useCollection";
import { useAuthContext } from "../../../hooks/useAuthContext";

// styles
import styles from "../Home.module.css";

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

  const calculateTotalRevenue = (sales) => {
    return sales.reduce((total, sale) => total + (sale.totalAmount || 0), 0);
  };

  const calculateTotalCosts = (restocks) => {
    return restocks.reduce(
      (total, restock) => total + (restock.totalAmount || 0),
      0
    );
  };

  useEffect(() => {
    if (restocksError || salesError) {
      console.log("Error retrieving data");
    } else if (restocks && sales) {
      const calculateTotalProfit = (sales, restocks) => {
        const salesAmount = calculateTotalRevenue(sales);
        const restocksCost = calculateTotalCosts(restocks);
        return salesAmount - restocksCost;
      };

      const revenue = calculateTotalRevenue(sales);
      const profit = calculateTotalProfit(sales, restocks);
      const costs = calculateTotalCosts(restocks);
      setTotalRevenue(revenue);
      setTotalProfit(profit);
      setTotalCosts(costs);
    }
  }, [restocks, sales, restocksError, salesError]);

  return (
    <div className={styles.metricsContainer}>
      <h3>Overall Sales Metrics</h3>
      <div className={styles.metrics}>
        <p>Lifetime Revenue: ${totalRevenue}</p>
        <p>Lifetime Costs: ${totalCosts}</p>
        <p>Lifetime Profit: ${totalProfit}</p>
      </div>
    </div>
  );
}
