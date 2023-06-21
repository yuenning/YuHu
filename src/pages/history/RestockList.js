import React, { useEffect, useState } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useCollection } from "../../hooks/useCollection";

// styles
import styles from "./History.module.css";

export default function RestockList() {
  const { user } = useAuthContext();
  const { documents: restockData, error: restockDataError } = useCollection(
    `users/${user.uid}/restocks`
  );

  const { documents: restockItemsData, error: restockItemsDataError } =
    useCollection(`users/${user.uid}/restockitems`);

  const [restocks, setRestocks] = useState([]);

  useEffect(() => {
    if (restockDataError || restockItemsDataError) {
      console.log("Error retrieving restock data:", restockDataError);
      console.log(
        "Error retrieving restock items data:",
        restockItemsDataError
      );
    } else {
      setRestocks(
        restockData?.map((restock) => ({
          ...restock,
          restockItems: restockItemsData.filter(
            (item) => item.transactionID === restock.transactionID
          ),
        })) || []
      );
    }
  }, [restockData, restockDataError, restockItemsData, restockItemsDataError]);

  // Add state variable for tracking expanded restock item
  const [expandedItemIndex, setExpandedItemIndex] = useState(null);

  // Function to toggle expanded restock item
  const handleToggleItem = (itemIndex) => {
    if (expandedItemIndex === itemIndex) {
      setExpandedItemIndex(null);
    } else {
      setExpandedItemIndex(itemIndex);
    }
  };

  return (
    <>
      <h3>Past Restock Transactions</h3>
      <ul className={styles.transactions}>
        {restocks.map((restock, itemIndex) => {
          const { transactionID, date, time, transactionAmount } = restock;
          return (
            <li key={transactionID}>
              <div>
                <p>Transaction ID: {transactionID}</p>
                <p>Date: {date}</p>
                <p>Time: {time}</p>
                <p>Transaction Amount: ${transactionAmount}</p>
              </div>
              {/* Additional details for expanded restock item */}
              {expandedItemIndex === itemIndex && (
                <div className={styles.details}>
                  {restock.restockItems.map((item, index) => (
                    <div key={index}>
                      <p>Product ID: {item.productId}</p>
                      <p>Quantity: {item.quantity}</p>
                      <p>Batch ID: {item.batchId}</p>
                      <p>Cost Price: {item.costPrice}</p>
                      <p>
                        Expiry Date:{" "}
                        {item.expiryDate.toDate().toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Toggle button */}
              <button onClick={() => handleToggleItem(itemIndex)}>
                {expandedItemIndex === itemIndex ? "Hide Details" : "Show More"}
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}
