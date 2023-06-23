import React, { useEffect, useState } from "react";
import { useCollection } from "../../../hooks/useCollection";
import { useAuthContext } from "../../../hooks/useAuthContext";
import { startOfMonth, endOfMonth } from "date-fns";
import { Line } from "react-chartjs-2";

// import components
import MonthlyInventoryTurnover from "./MonthlyInventoryTurnover";
import MonthlyProductAnalysis from "./MonthlyProductsAnalysis";

// styles
import styles from "../Home.module.css";

export default function MonthlySalesMetrics() {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [totalCosts, setTotalCosts] = useState(0);
  const [dailyData, setDailyData] = useState([]);

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
      const calculateDailyData = (sales, restocks) => {
        const currentDate = new Date();
        const daysInMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0
        ).getDate();

        const dailyData = Array.from({ length: daysInMonth }, (_, i) => ({
          date: i + 1,
          revenue: 0,
          costs: 0,
          profit: 0,
        }));

        sales.forEach((sale) => {
          const saleDate = new Date(sale.date);
          const dayOfMonth = saleDate.getDate();
          const saleAmount = sale.transactionAmount || 0;
          const saleProfit = saleAmount - calculateTotalCosts(restocks);
          dailyData[dayOfMonth - 1].revenue += saleAmount;
          dailyData[dayOfMonth - 1].profit += saleProfit;
        });

        restocks.forEach((restock) => {
          const restockDate = new Date(restock.date);
          const dayOfMonth = restockDate.getDate();
          const restockCost = restock.transactionAmount || 0;
          dailyData[dayOfMonth - 1].costs += restockCost;
        });

        return dailyData;
      };

      const dailyData = calculateDailyData(
        currentMonthSales,
        currentMonthRestocks
      );
      setDailyData(dailyData);
    }
  }, [restocks, sales, restocksError, salesError]);

  const chartData = {
    labels: dailyData.map((data) => data.date),
    datasets: [
      {
        label: "Revenue",
        data: dailyData.map((data) => data.revenue),
        fill: false,
        borderColor: "#333333",
        tension: 0.1,
      },
      {
        label: "Costs",
        data: dailyData.map((data) => data.costs),
        fill: false,
        borderColor: "#ffffff",
        tension: 0.1,
      },
      {
        label: "Profit",
        data: dailyData.map((data) => data.profit),
        fill: false,
        borderColor: "#858585",
        tension: 0.1,
      },
    ],
  };

  return (
    <>
      <div className={styles.metricsContainer}>
        <h3>Monthly Sales Metrics</h3>
        <div className={styles.metrics}>
          <p>Current Month Revenue: ${totalRevenue.toFixed(2)}</p>
          <p>Current Month Costs: ${totalCosts.toFixed(2)}</p>
          <p>Current Month Profit: ${totalProfit.toFixed(2)}</p>
          <p>
            Inventory Turnover: <MonthlyInventoryTurnover />
          </p>
        </div>
      </div>
      <div className={styles.chartContainer}>
        <div className={styles.centered}>
          <Line data={chartData} />
        </div>
      </div>
      <div className={styles.metricsContainer}>
        <MonthlyProductAnalysis />
      </div>
    </>
  );
}
