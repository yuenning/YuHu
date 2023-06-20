import React, { useState, useEffect } from "react";
import { projectFirestore } from "../../../firebase/config";
import { useAuthContext } from "../../../hooks/useAuthContext";

import { PieChart } from "react-minimal-pie-chart";

export default function OverallProductAnalysis() {
  const { user } = useAuthContext();
  const [topSellingProducts, setTopSellingProducts] = useState([]);

  function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  useEffect(() => {
    const getTopSellingProducts = async () => {
      try {
        const salesSnapshot = await projectFirestore
          .collection(`users/${user?.uid}/sales`)
          .get();

        const productSales = {};

        salesSnapshot.forEach(async (saleDoc) => {
          const saleItemsSnapshot = await projectFirestore
            .collection(`users/${user?.uid}/saleitems`)
            .where("restockId", "==", saleDoc.data().restockID)
            .get();

          saleItemsSnapshot.forEach((saleItemDoc) => {
            const saleItemData = saleItemDoc.data();

            if (productSales[saleItemData.productId]) {
              productSales[saleItemData.productId] += saleItemData.quantity;
            } else {
              productSales[saleItemData.productId] = saleItemData.quantity;
            }
          });
        });

        const sortedProducts = Object.entries(productSales).sort(
          (a, b) => b[1] - a[1]
        );

        const topSelling = sortedProducts
          .slice(0, 5)
          .map(async ([productId, quantity]) => {
            const productSnapshot = await projectFirestore
              .collection(`users/${user?.uid}/products`)
              .where("productId", "==", productId)
              .get();

            const productData = productSnapshot.docs[0].data();
            return { name: productData.productName, quantity };
          });

        const resolvedTopSelling = await Promise.all(topSelling);
        setTopSellingProducts(resolvedTopSelling);
      } catch (error) {
        console.error("Error retrieving data:", error);
      }
    };

    getTopSellingProducts();
  }, [user]);

  return (
    <div>
      <h4>Top Selling Products</h4>
      <ul>
        <p></p>
      </ul>
      {/*
      <PieChart
        data={topSellingProducts.map((product) => ({
          title: product.name,
          value: product.quantity,
        }))}
      />
    */}
    </div>
  );
}
