import React, { useEffect, useState } from "react";
import { useCollection } from "../../../hooks/useCollection";
import { useAuthContext } from "../../../hooks/useAuthContext";
import { startOfMonth, endOfMonth } from "date-fns";

// styles
import styles from "../Home.module.css";

export default function MonthlySalesMetrics() {
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
    return sales.reduce(
      (total, sale) => total + (sale.transactionAmount || 0),
      0
    );
  };

  const calculateTotalCosts = (restocks) => {
    return restocks.reduce(
      (total, restock) => total + (restock.transactionAmount || 0),
      0
    );
  };

  useEffect(() => {
    if (restocksError || salesError) {
      console.log("Error retrieving data");
    } else if (restocks && sales) {
      const currentMonthStart = startOfMonth(new Date());
      const currentMonthEnd = endOfMonth(new Date());

      const currentMonthSales = sales.filter(
        (sale) =>
          sale.date >= currentMonthStart.toISOString() &&
          sale.date <= currentMonthEnd.toISOString()
      );

      const currentMonthRestocks = restocks.filter(
        (restock) =>
          restock.date >= currentMonthStart.toISOString() &&
          restock.date <= currentMonthEnd.toISOString()
      );

      const calculateTotalProfit = (sales, restocks) => {
        const salesAmount = calculateTotalRevenue(sales);
        const restocksCost = calculateTotalCosts(restocks);
        return salesAmount - restocksCost;
      };

      const revenue = calculateTotalRevenue(currentMonthSales);
      const profit = calculateTotalProfit(
        currentMonthSales,
        currentMonthRestocks
      );
      const costs = calculateTotalCosts(currentMonthRestocks);
      setTotalRevenue(revenue);
      setTotalProfit(profit);
      setTotalCosts(costs);
    }
  }, [restocks, sales, restocksError, salesError]);

  return (
    <div className={styles.metricsContainer}>
      <h3>Monthly Sales Metrics</h3>
      <div className={styles.metrics}>
        <p>Current Month Revenue: ${totalRevenue}</p>
        <p>Current Month Costs: ${totalCosts}</p>
        <p>Current Month Profit: ${totalProfit}</p>
      </div>
    </div>
  );
}
