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

// Add a new component for the Line Chart
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

export default function CustomDashboard() {
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

  const [startDate, setStartDate] = useState(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState(endOfMonth(new Date()));

  const [dailyData, setDailyData] = useState([]);

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
  }, [restocks, sales, restocksError, salesError, startDate, endDate]);

  return (
    <>
      <div className={styles.metricsContainer}>
        <div className={styles.datePickerContainer}>
          <label>Start Date: </label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            dateFormat="yyyy-MM-dd"
          />
          <br />
          <label>End Date: </label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            dateFormat="yyyy-MM-dd"
          />
        </div>
        <br />
        <h3>Monthly Sales Metrics</h3>
        <div className={styles.metrics}>
          <p>Current Month Revenue: ${totalRevenue}</p>
          <p>Current Month Costs: ${parseFloat(totalCosts).toFixed(2)}</p>
          <p>Current Month Profit: ${totalProfit.toFixed(2)}</p>
          <p>
            Inventory Turnover: <MonthlyInventoryTurnover />
          </p>
        </div>
      </div>
      <div className={styles.metricsContainer}>
        {/* Render the LineChart component and pass the dailyData */}
        <LineChart chartData={dailyData} />
        <MonthlyProductAnalysis />
      </div>
    </>
  );
}
