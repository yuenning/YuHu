import React, { useEffect, useState } from "react";
import { useCollection } from "../../../hooks/useCollection";
import { useAuthContext } from "../../../hooks/useAuthContext";
import {
  startOfMonth,
  endOfMonth,
  isAfter,
  eachDayOfInterval,
  isSameDay,
} from "date-fns";

import { Line } from "react-chartjs-2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// import components
import MonthlyInventoryTurnover from "./MonthlyInventoryTurnover";
import MonthlyProductAnalysis from "./MonthlyProductsAnalysis";

// styles
import styles from "../Home.module.css";

const LineChart = ({ chartData }) => {
  const data = {
    labels: chartData.map((data) => data.date),
    datasets: [
      {
        label: "Daily Revenue",
        data: chartData.map((data) => data.revenue),
        fill: false,
        borderColor: "#333333",
        tension: 0.1,
      },
      {
        label: "Daily Costs",
        data: chartData.map((data) => data.costs),
        fill: false,
        borderColor: "#ffffff",
        tension: 0.1,
      },
      {
        label: "Daily Profit",
        data: chartData.map((data) => data.profit),
        fill: false,
        borderColor: "#858585",
        tension: 0.1,
      },
    ],
  };

  return <Line data={data} />;
};

export default function MonthlySalesMetrics() {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [totalCosts, setTotalCosts] = useState(0);

  const [startDate, setStartDate] = useState(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState(endOfMonth(new Date()));

  const [dailyData, setDailyData] = useState([]);

  const { user } = useAuthContext();
  const { documents: restocks, error: restocksError } = useCollection(
    `users/${user?.uid}/restocks`
  );
  const { documents: sales, error: salesError } = useCollection(
    `users/${user?.uid}/sales`
  );

  const calculateTotalRevenue = (sales) => {
    return parseFloat(
      sales.reduce((total, sale) => total + (sale.transactionAmount || 0), 0)
    ).toFixed(2);
  };

  const calculateTotalCosts = (restocks) => {
    return parseFloat(
      restocks.reduce(
        (total, restock) => total + (restock.transactionAmount || 0),
        0
      )
    ).toFixed(2);
  };

  const calculateTotalProfit = (sales, restocks) => {
    const salesAmount = calculateTotalRevenue(sales);
    const restocksCost = calculateTotalCosts(restocks);
    return parseFloat(salesAmount) - parseFloat(restocksCost);
  };

  useEffect(() => {
    if (restocksError || salesError) {
      console.log("Error retrieving data");
    } else if (restocks && sales) {
      const currentMonthSales = sales.filter(
        (sale) =>
          sale.dateTime &&
          isAfter(sale.dateTime.toDate(), startDate) &&
          isAfter(endDate, sale.dateTime.toDate())
      );

      const currentMonthRestocks = restocks.filter(
        (restock) =>
          restock.dateTime &&
          isAfter(restock.dateTime.toDate(), startDate) &&
          isAfter(endDate, restock.dateTime.toDate())
      );

      // Calculate the daily data for the selected dates
      const selectedDates = eachDayOfInterval({
        start: startDate,
        end: endDate,
      });
      const dailyData = selectedDates.map((date) => {
        const dateSales = currentMonthSales.filter((sale) =>
          isSameDay(sale.dateTime.toDate(), date)
        );
        const dateRestocks = currentMonthRestocks.filter((restock) =>
          isSameDay(restock.dateTime.toDate(), date)
        );

        const dailyRevenue = calculateTotalRevenue(dateSales);
        const dailyCosts = calculateTotalCosts(dateRestocks);
        const dailyProfit = parseFloat(dailyRevenue) - parseFloat(dailyCosts);

        return {
          date: date.toLocaleDateString(),
          revenue: parseFloat(dailyRevenue).toFixed(2),
          costs: parseFloat(dailyCosts).toFixed(2),
          profit: parseFloat(dailyProfit).toFixed(2),
        };
      });
      setDailyData(dailyData);

      let revenue = 0.0;
      let profit = 0.0;
      let costs = 0.0;
      dailyData.forEach((data) => {
        revenue += parseFloat(data.revenue);
        profit += parseFloat(data.profit);
        costs += parseFloat(data.costs);
      });

      /*const revenue = calculateTotalRevenue(currentMonthSales);
      const profit = calculateTotalProfit(
        currentMonthSales,
        currentMonthRestocks
      );
      const costs = calculateTotalCosts(currentMonthRestocks);
      */
      setTotalRevenue(revenue);
      setTotalProfit(profit);
      setTotalCosts(costs);
    }
  }, [restocks, sales, restocksError, salesError, startDate, endDate]);

  return (
    <>
      <div className={styles.metricsContainer}>
        <h2>Custom Sales Metrics</h2>
        <br />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginRight: "10px",
            }}
          >
            <div className={styles.datePicker}>
              <label style={{ marginRight: "10px" }}>Start Date:</label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                dateFormat="yyyy-MM-dd"
                style={{
                  padding: "8px",
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                  fontSize: "14px",
                }}
              />
            </div>
          </div>
          <div className={styles.datePicker}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <label style={{ marginRight: "10px" }}>End Date:</label>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                dateFormat="yyyy-MM-dd"
                style={{
                  padding: "8px",
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                  fontSize: "14px",
                }}
              />
            </div>
          </div>
        </div>

        <div className={styles.metrics}>
          <p>Total Revenue: ${totalRevenue}</p>
          <p>Total Costs: ${totalCosts}</p>
          <p>Total Profit: ${totalProfit}</p>
          <p>
            Inventory Turnover:{" "}
            <MonthlyInventoryTurnover startDate={startDate} endDate={endDate} />
          </p>
        </div>
      </div>
      <div className={styles.chartContainer}>
        <div className={styles.centered}>
          <LineChart chartData={dailyData} />
        </div>
      </div>
      <div className={styles.metricsContainer}>
        <MonthlyProductAnalysis startDate={startDate} endDate={endDate} />
      </div>
    </>
  );
}
