import React, { useEffect, useState, useMemo } from "react";
import { useCollection } from "../../../hooks/useCollection";
import { useAuthContext } from "../../../hooks/useAuthContext";
import { startOfMonth, addMonths } from "date-fns";
import { Line } from "react-chartjs-2";
import * as tf from "@tensorflow/tfjs";
import { scaleLinear, scaleTime } from "d3-scale";

// styles
import styles from "../Home.module.css";

export default function SalesPrediction() {
  const [predictedData, setPredictedData] = useState([]);
  const { user } = useAuthContext();
  const { documents: sales, error: salesError } = useCollection(
    `users/${user?.uid}/sales`
  );

  // Memoize the computation of predicted sales data using useMemo
  const memoizedPredictedData = useMemo(() => {
    if (salesError) {
      return [];
    } else {
      const currentMonthStart = startOfMonth(new Date());
      const nextThreeMonths = Array.from({ length: 3 }, (_, i) =>
        addMonths(currentMonthStart, i + 1)
      );

      if (sales && sales.length > 0) {
        const salesData = sales.map((sale) => [
          sale.dateTime.toDate().getTime(),
          parseFloat(sale.transactionAmount) || 0,
        ]);

        const xScale = scaleTime()
          .domain([salesData[0][0], salesData[salesData.length - 1][0]])
          .range([0, 1]);

        const yScale = scaleLinear()
          .domain([0, Math.max(...salesData.map(([, y]) => y))])
          .range([0, 1]);

        const scaledSalesData = salesData.map(([x, y]) => [
          xScale(x),
          yScale(y),
        ]);

        const inputTensor = tf.tensor2d(
          scaledSalesData.map(([x]) => x),
          [scaledSalesData.length, 1]
        );
        const outputTensor = tf.tensor2d(
          scaledSalesData.map(([, y]) => y),
          [scaledSalesData.length, 1]
        );

        const model = tf.sequential();
        model.add(tf.layers.dense({ units: 1, inputShape: [1] }));
        model.compile({ loss: "meanSquaredError", optimizer: "adam" });

        model.fit(inputTensor, outputTensor, { epochs: 100 }).then(() => {
          const predictedSales = nextThreeMonths.map((month) => ({
            date: month,
            amount: yScale.invert(
              model
                .predict(
                  tf.tensor2d([xScale(new Date(month).getTime())], [1, 1])
                )
                ?.dataSync()[0] || 0
            ),
          }));

          setPredictedData(predictedSales);
        });
      } else {
        // Handle case when there are no sales data
        setPredictedData([]);
      }

      // Return an empty array if there's an error or while the sales data is being fetched
      return [];
    }
  }, [sales, salesError]);

  // Update state only when there's a change in the predicted data
  useEffect(() => {
    setPredictedData(memoizedPredictedData);
  }, [memoizedPredictedData]);

  const chartData = {
    labels: predictedData.map((data) => data.date.toLocaleDateString()),
    datasets: [
      {
        label: "Revenue",
        data: predictedData.map((data) => data.amount),
        fill: false,
        borderColor: "#888888",
        tension: 0.1,
      },
    ],
  };

  return (
    <div className={styles.metricsContainer}>
      <h3>Sales Prediction For The Next 3 Months</h3>
      <div className={styles.chartContainer}>
        <div className={styles.centered}>
          <Line data={chartData} />
        </div>
      </div>
    </div>
  );
}
