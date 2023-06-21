import React, { useEffect, useState } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useCollection } from "../../hooks/useCollection";

// styles
import styles from "./History.module.css";

export default function SalesList() {
  const { user } = useAuthContext();
  const { documents: salesData, error: salesDataError } = useCollection(
    `users/${user.uid}/sales`
  );

  const { documents: salesItemsData, error: salesItemsDataError } =
    useCollection(`users/${user.uid}/salesitems`);

  const [sales, setSales] = useState([]);

  useEffect(() => {
    if (salesDataError || salesItemsDataError) {
      console.log("Error retrieving sales data:", salesDataError);
      console.log("Error retrieving sales items data:", salesItemsDataError);
    } else {
      setSales(
        salesData?.map((sales) => ({
          ...sales,
          salesItems: salesItemsData.filter(
            (item) => item.transactionID === sales.transactionID
          ),
        })) || []
      );
    }
  }, [salesData, salesDataError, salesItemsData, salesItemsDataError]);

  // Add state variable for tracking expanded sales item
  const [expandedItemIndex, setExpandedItemIndex] = useState(null);

  // Function to toggle expanded sales item
  const handleToggleItem = (itemIndex) => {
    if (expandedItemIndex === itemIndex) {
      setExpandedItemIndex(null);
    } else {
      setExpandedItemIndex(itemIndex);
    }
  };

  return (
    <>
      <h3>Past Sales Transactions</h3>
      <ul className={styles.transactions}>
        {sales.map((sales, itemIndex) => {
          const { transactionID, date, time, transactionAmount } = sales;
          return (
            <li key={transactionID}>
              <div>
                <p>Transaction ID: {transactionID}</p>
                <p>Date: {date}</p>
                <p>Time: {time}</p>
                <p>Transaction Amount: ${transactionAmount}</p>
              </div>
              {/* Additional details for expanded sales item */}
              {expandedItemIndex === itemIndex && (
                <div className={styles.details}>
                  {sales.salesItems.map((item, index) => (
                    <div key={index}>
                      <p>Product ID: {item.productId}</p>
                      <p>Product Name: {item.productName}</p>
                      <p>Quantity: {item.quantity}</p>
                      <p>Selling Price: {item.sellingPrice}</p>
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
