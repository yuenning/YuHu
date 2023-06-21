import React, { useEffect, useState } from "react";
import { useCollection } from "../../../hooks/useCollection";
import { useAuthContext } from "../../../hooks/useAuthContext";
import { Line } from "react-chartjs-2";
import { format } from "date-fns";

// relevant components
import OverallInventoryTurnover from "./OverallInventoryTurnover";
import SalesPrediction from "./SalesTrendPrediction";

// styles
import styles from "../Home.module.css";

export default function OverallSalesMetrics() {
  const [monthlyData, setMonthlyData] = useState([]);
  const [chartData, setChartData] = useState(null);
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

  const calculateTotalProfit = (sales, restocks) => {
    const salesAmount = calculateTotalRevenue(sales);
    const restocksCost = calculateTotalCosts(restocks);
    return salesAmount - restocksCost;
  };

  useEffect(() => {
    if (restocksError || salesError) {
      console.log("Error retrieving data");
    } else if (restocks && sales) {
      const monthlySales = {};
      sales.forEach((sale) => {
        const month = format(new Date(sale.date), "yyyy-MM");
        if (!monthlySales[month]) {
          monthlySales[month] = {
            revenue: 0,
            costs: 0,
            profit: 0,
          };
        }
        monthlySales[month].revenue += sale.transactionAmount || 0;
      });

      restocks.forEach((restock) => {
        const month = format(new Date(restock.date), "yyyy-MM");
        if (monthlySales[month]) {
          monthlySales[month].costs += restock.transactionAmount || 0;
        }
      });

      Object.keys(monthlySales).forEach((month) => {
        const { revenue, costs } = monthlySales[month];
        monthlySales[month].profit = revenue - costs;
      });

      setMonthlyData(Object.entries(monthlySales));

      const revenue = calculateTotalRevenue(sales);
      const profit = calculateTotalProfit(sales, restocks);
      const costs = calculateTotalCosts(restocks);
      setTotalRevenue(revenue);
      setTotalProfit(profit);
      setTotalCosts(costs);
    }
  }, [restocks, sales, restocksError, salesError]);

  useEffect(() => {
    if (monthlyData.length > 0) {
      const labels = monthlyData.map(([month]) => month);
      const revenueData = monthlyData.map(([_, { revenue }]) => revenue);
      const profitData = monthlyData.map(([_, { profit }]) => profit);
      const costsData = monthlyData.map(([_, { costs }]) => costs);

      setChartData({
        labels,
        datasets: [
          {
            label: "Revenue",
            data: revenueData,
            borderColor: "rgba(75, 192, 192, 1)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
          },
          {
            label: "Profit",
            data: profitData,
            borderColor: "rgb(54, 162, 235)",
            backgroundColor: "rgba(54, 162, 235, 0.2)",
          },
          {
            label: "Costs",
            data: costsData,
            borderColor: "rgb(255, 99, 132)",
            backgroundColor: "rgba(255, 99, 132, 0.2)",
          },
        ],
      });
    }
  }, [monthlyData]);

  return (
    <div className={styles.metricsContainer}>
      <h3>Overall Sales Metrics</h3>
      <div className={styles.metrics}>
        <p>Lifetime Revenue: ${totalRevenue}</p>
        <p>Lifetime Costs: ${totalCosts}</p>
        <p>Lifetime Profit: ${totalProfit}</p>
        <p>
          Inventory Turnover: <OverallInventoryTurnover />
        </p>
      </div>
      <br></br>
      <h3>Revenue, Profit and Costs across Months</h3>
      <div className={styles.metrics}>
        {chartData ? (
          <div>
            <Line data={chartData} />
          </div>
        ) : (
          <p>No data available for chart.</p>
        )}
      </div>
      <div>
        <SalesPrediction />
      </div>
    </div>
  );
}
