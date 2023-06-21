import React, { useEffect, useState } from "react";
import { useCollection } from "../../../hooks/useCollection";
import { useAuthContext } from "../../../hooks/useAuthContext";

export default function MonthlyInventoryTurnover() {
  const { user } = useAuthContext();
  const { documents: products, error: productsError } = useCollection(
    `users/${user.uid}/products`
  );
  const { documents: restockItems, error: restockItemsError } = useCollection(
    `users/${user.uid}/restockitems`
  );
  const { documents: salesItems, error: salesItemsError } = useCollection(
    `users/${user.uid}/salesitems`
  );
  const { documents: sales, error: salesError } = useCollection(
    `users/${user.uid}/sales`
  );

  const [inventoryTurnover, setInventoryTurnover] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (products && restockItems && salesItems && sales) {
      const currentMonthSalesItems = filterSalesItemsByMonth(salesItems, sales);
      const totalCOGS = calculateTotalCOGS(
        restockItems,
        currentMonthSalesItems
      );
      const averageInventory = calculateAverageInventory(products);

      if (averageInventory > 0) {
        const turnover = totalCOGS / averageInventory;
        setInventoryTurnover(turnover);
      } else {
        setInventoryTurnover(0);
      }

      setIsLoading(false);
    }
  }, [products, restockItems, salesItems, sales]);

  function filterSalesItemsByMonth(salesItems, sales) {
    const currentMonth = new Date().getMonth(); // Get the current month (0-indexed)
    const currentMonthSales = sales.filter((sale) => {
      const transactionDate = new Date(sale.date); // Convert the date string to a JavaScript Date object
      const transactionMonth = transactionDate.getMonth(); // Get the month of the transaction
      return transactionMonth === currentMonth;
    });
    return salesItems.filter((item) =>
      currentMonthSales.some(
        (sale) => sale.transactionID === item.transactionID
      )
    );
  }

  function calculateTotalCOGS(restockItems, salesItems) {
    const totalCOGS = salesItems.reduce((acc, item) => {
      const product = restockItems.find(
        (restockItem) => restockItem.productId === item.productId
      );
      if (product) {
        const { quantity, costPrice } = product;
        return acc + quantity * costPrice;
      }
      return acc;
    }, 0);

    return totalCOGS;
  }

  function calculateAverageInventory(products) {
    const totalInventoryValue = products.reduce((acc, item) => {
      const { totalQuantity, batchDetails } = item;
      const latestBatch = batchDetails[batchDetails.length - 1];
      const { costPrice } = latestBatch;
      return acc + totalQuantity * costPrice;
    }, 0);

    const averageInventory = totalInventoryValue / products.length;

    return averageInventory;
  }

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (productsError || restockItemsError || salesItemsError || salesError) {
    return (
      <p>
        Error occurred:{" "}
        {productsError || restockItemsError || salesItemsError || salesError}
      </p>
    );
  }

  return (
    <div>
      <p>Inventory Turnover: {inventoryTurnover.toFixed(2)}</p>
    </div>
  );
}
