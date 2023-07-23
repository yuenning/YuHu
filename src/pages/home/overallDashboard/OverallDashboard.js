import React, { useEffect, useState } from "react";
import { useCollection } from "../../../hooks/useCollection";
import { useAuthContext } from "../../../hooks/useAuthContext";
import { Line } from "react-chartjs-2";
import { format } from "date-fns";

// relevant components
import OverallInventoryTurnover from "./OverallInventoryTurnover";
import SalesPrediction from "./SalesTrendPrediction";
import OverallProductAnalysis from "./OverallProductsAnalysis";

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

  useEffect(() => {
    if (restocksError || salesError) {
      console.log("Error retrieving data");
    } else if (restocks && sales) {
      const monthlySales = {};
      sales.forEach((sale) => {
        try {
          const month = format(new Date(sale.dateTime.toDate()), "yyyy-MM");
          if (!monthlySales[month]) {
            monthlySales[month] = {
              revenue: 0,
              costs: 0,
              profit: 0,
            };
          }
          monthlySales[month].revenue +=
            parseFloat(sale.transactionAmount) || 0;
        } catch (error) {
          console.log("Error formatting date in sale:", sale);
          console.log("Error formatting date:", error);
        }
      });

      restocks.forEach((restock) => {
        try {
          const month = format(new Date(restock.dateTime.toDate()), "yyyy-MM");
          if (monthlySales[month]) {
            monthlySales[month].costs +=
              parseFloat(restock.transactionAmount) || 0;
          }
        } catch (error) {
          console.log("Error formatting date in restock:", restock);
          console.log("Error formatting date:", error);
        }
      });

      Object.keys(monthlySales).forEach((month) => {
        const { revenue, costs } = monthlySales[month];
        monthlySales[month].profit = parseFloat(revenue) - parseFloat(costs);
      });

      setMonthlyData(Object.entries(monthlySales));

      // Sort monthlyData in chronological order based on the month
      setMonthlyData((prevData) =>
        prevData.sort(([monthA], [monthB]) => {
          return new Date(monthA) - new Date(monthB);
        })
      );

      const calculateTotalRevenue = (sales) => {
        return sales.reduce(
          (total, sale) => total + (parseFloat(sale.transactionAmount) || 0),
          0
        );
      };

      const calculateTotalCosts = (restocks) => {
        return restocks.reduce(
          (total, restock) =>
            total + (parseFloat(restock.transactionAmount) || 0),
          0
        );
      };

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
            borderColor: "#",
          },
          {
            label: "Profit",
            data: profitData,
            borderColor: "#858585",
          },
          {
            label: "Costs",
            data: costsData,
            borderColor: "#CCCCCC",
          },
        ],
      });
    }
  }, [monthlyData]);

  return (
    <div className={styles.metricsContainer}>
      <h3>Overall Sales Metrics</h3>
      <div className={styles.metrics}>
        <p>Lifetime Revenue: ${totalRevenue.toFixed(2)}</p>
        <p>Lifetime Costs: ${parseFloat(totalCosts).toFixed(2)}</p>
        <p>Lifetime Profit: ${totalProfit.toFixed(2)}</p>
        <p>
          Inventory Turnover: <OverallInventoryTurnover />
        </p>
      </div>
      <br></br>
      <h3>Revenue, Profit and Costs across Months</h3>
      <div className={styles.chartContainer}>
        <div className={styles.centered}>
          {chartData ? (
            <div>
              <Line data={chartData} />
            </div>
          ) : (
            <p>No data available for chart.</p>
          )}
        </div>
      </div>
      <div>
        <SalesPrediction />
      </div>
      <div>
        <OverallProductAnalysis />
      </div>
    </div>
  );
}
