import React, { useEffect, useState } from "react";
import { useCollection } from "../../hooks/useCollection";
import { useAuthContext } from "../../hooks/useAuthContext";

// styles
import styles from "./Inventory.module.css";

export default function Inventory() {
  const [mergedQuantities, setMergedQuantities] = useState({});

  // Fetch restocks collection
  const { user } = useAuthContext();
  const { documents: restocks, error: restocksError } = useCollection(
    `users/${user.uid}/restockitems`
  );

  // Fetch sales collection
  const { documents: sales, error: salesError } = useCollection(
    `users/${user.uid}/salesitems`
  );

  useEffect(() => {
    // Calculate product quantities based on restocks and sales
    if (restocksError || salesError) {
      console.log("Error retrieving data");
    } else if (restocks && sales) {
      const restockQuantities = calculateQuantities(
        restocks,
        "productId",
        "quantity"
      );
      const salesQuantities = calculateQuantities(
        sales,
        "productId",
        "quantity"
      );
      const mergedQuantities = mergeQuantities(
        restockQuantities,
        salesQuantities
      );
      setMergedQuantities(mergedQuantities);
    }
  }, [restocks, sales, restocksError, salesError]);

  const calculateQuantities = (collection, idField, quantityField) => {
    return collection.reduce((quantities, item) => {
      const itemId = item[idField];
      const itemQuantity = item[quantityField];

      if (itemId && itemQuantity) {
        quantities[itemId] = (quantities[itemId] || 0) + itemQuantity;
      }

      return quantities;
    }, {});
  };

  const mergeQuantities = (restockQuantities, salesQuantities) => {
    const mergedQuantities = { ...restockQuantities };

    for (const itemId in salesQuantities) {
      if (mergedQuantities.hasOwnProperty(itemId)) {
        mergedQuantities[itemId] -= salesQuantities[itemId];
      } else {
        mergedQuantities[itemId] = -salesQuantities[itemId];
      }
    }

    return mergedQuantities;
  };

  const products = Object.keys(mergedQuantities).map((productId) => {
    return {
      productId: productId,
      quantity: mergedQuantities[productId] || 0,
    };
  });

  return (
    <div className={styles.container}>
      <h3>Products List</h3>
      <ul className={styles.transactions}>
        {products.map((product) => (
          <li key={product.productId}>
            <p className={styles.name}>{product.productId}</p>
            <p className={styles.amount}>{product.quantity}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
