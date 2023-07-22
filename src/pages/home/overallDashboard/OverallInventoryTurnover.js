import React, { useEffect, useState } from "react";
import { useCollection } from "../../../hooks/useCollection";
import { useAuthContext } from "../../../hooks/useAuthContext";

export default function OverallInventoryTurnover() {
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

  const [inventoryTurnover, setInventoryTurnover] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (products && restockItems && salesItems) {
      const totalCOGS = calculateTotalCOGS(restockItems, salesItems);
      const averageInventory = calculateAverageInventory(products);

      if (averageInventory > 0) {
        const turnover = totalCOGS / averageInventory;
        setInventoryTurnover(turnover);
      } else {
        setInventoryTurnover(0);
      }

      setIsLoading(false);
    }
  }, [products, restockItems, salesItems]);

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
      if (batchDetails && batchDetails.length > 0) {
        // Check if batchDetails is not empty before accessing its elements
        const latestBatch = batchDetails[batchDetails.length - 1];
        if (latestBatch && latestBatch.costPrice) {
          // Ensure latestBatch and costPrice exist before accessing costPrice
          const { costPrice } = latestBatch;
          return acc + totalQuantity * costPrice;
        }
      }
      return acc;
    }, 0);

    const averageInventory = totalInventoryValue / products.length;
    return averageInventory;
  }

  if (isLoading) {
    return "Loading...";
  }

  if (productsError || restockItemsError || salesItemsError) {
    return "Error";
  }

  return inventoryTurnover.toFixed(2);
}
