import React, { useEffect, useState } from "react";
import { useCollection } from "../../../hooks/useCollection";
import { useAuthContext } from "../../../hooks/useAuthContext";
import { startOfMonth, endOfMonth } from "date-fns";

// components for the pie chart
import "chart.js/auto";
import { Pie } from "react-chartjs-2";

export default function MonthlyProductAnalysis() {
  const { user } = useAuthContext();
  const { documents: salesItems, error: salesItemsError } = useCollection(
    `users/${user.uid}/salesitems`
  );
  const { documents: sales, error: salesError } = useCollection(
    `users/${user.uid}/sales`
  );

  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (salesItems && sales) {
      const currentMonthStart = startOfMonth(new Date());
      const currentMonthEnd = endOfMonth(new Date());

      const salesByProduct = salesItems.reduce((acc, item) => {
        const { productId, productName, quantity, transactionID } = item;
        const sale = sales.find((sale) => sale.transactionID === transactionID);
        if (sale) {
          const saleDate = new Date(sale.date);
          if (saleDate >= currentMonthStart && saleDate <= currentMonthEnd) {
            if (!acc[productId]) {
              acc[productId] = { productId, productName, totalQuantity: 0 };
            }
            acc[productId].totalQuantity += parseInt(quantity);
          }
        }
        return acc;
      }, {});

      const sortedProducts = Object.values(salesByProduct).sort(
        (a, b) => b.totalQuantity - a.totalQuantity
      );

      const top5Products = sortedProducts.slice(0, 5);
      setTopSellingProducts(top5Products);
      setIsLoading(false);
    }
  }, [salesItems, sales]);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (salesItemsError || salesError) {
    return (
      <p>Error occurred: {salesItemsError?.message || salesError?.message}</p>
    );
  }

  const chartData = {
    labels: topSellingProducts?.map((product) => product.productName) ?? [],
    datasets: [
      {
        data: topSellingProducts?.map((product) => product.totalQuantity) ?? [],
        backgroundColor: [
          "#888888",
          "#CCCCCC",
          "#DDDDDD",
          "#EEEEEE",
          "#F5F5F5",
        ],
        hoverBackgroundColor: [
          "#888888",
          "#CCCCCC",
          "#DDDDDD",
          "#EEEEEE",
          "#F5F5F5",
        ],
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        display: true,
        position: "bottom",
      },
    },
    responsive: true,
    animation: {
      animateRotate: true,
      animateScale: true,
    },
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ width: "25%" }}>
        <h3 style={{ textAlign: "center" }}>
          Top 5 Best Selling Products This Month
        </h3>
        {topSellingProducts.length > 0 ? (
          <Pie data={chartData} options={chartOptions} />
        ) : (
          <p>No data available.</p>
        )}
      </div>
    </div>
  );
}
