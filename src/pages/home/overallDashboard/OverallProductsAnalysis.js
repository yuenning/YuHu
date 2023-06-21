import React, { useEffect, useState } from "react";
import { useCollection } from "../../../hooks/useCollection";
import { useAuthContext } from "../../../hooks/useAuthContext";

// components for the pie chart
import "chart.js/auto";
import { Pie } from "react-chartjs-2";

export default function OverallProductAnalysis() {
  const { user } = useAuthContext();
  const { documents, error } = useCollection(`users/${user.uid}/salesitems`);

  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (documents) {
      const salesByProduct = documents.reduce((acc, item) => {
        const { productId, productName, quantity } = item;
        if (!acc[productId]) {
          acc[productId] = { productId, productName, totalQuantity: 0 };
        }
        acc[productId].totalQuantity += parseInt(quantity);
        return acc;
      }, {});

      const sortedProducts = Object.values(salesByProduct).sort(
        (a, b) => b.totalQuantity - a.totalQuantity
      );

      const top5Products = sortedProducts.slice(0, 5);
      setTopSellingProducts(top5Products);
      setIsLoading(false);
    }
  }, [documents]);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error occurred: {error.message}</p>;
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
          Top 5 All-Time Best Selling Products
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
