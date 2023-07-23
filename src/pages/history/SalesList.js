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
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (salesDataError || salesItemsDataError) {
      console.log("Error retrieving sales data:", salesDataError);
      console.log("Error retrieving sales items data:", salesItemsDataError);
    } else {
      const sortedSales = salesData
        ?.map((sales) => ({
          ...sales,
          salesItems: salesItemsData.filter(
            (item) => item.transactionID === sales.transactionID
          ),
        }))
        .sort((a, b) => {
          const dateA = new Date(a.date + " " + a.time);
          const dateB = new Date(b.date + " " + b.time);
          return dateB - dateA; // Sort in descending order (latest first)
        });

      setSales(sortedSales || []);
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

  // Filter the sales based on search query
  const filteredSales = sales.filter((sale) => {
    if (searchQuery.trim() === "") {
      return true; // If search query is empty, show all restocks
    }
    const query = searchQuery.toLowerCase();
    return (
      sale.transactionID.toLowerCase().includes(query) ||
      sale.date.toLowerCase().includes(query) ||
      sale.time.toLowerCase().includes(query)
    );
  });

  return (
    <>
      <h3>Past Sales Transactions</h3>
      <input
        type="text"
        placeholder="Search by transaction ID, date, or time"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "50%",
          colour: "black",
          border: "1px solid black",
          borderRadius: "5px",
        }}
      />
      <ul className={styles.transactions}>
        {filteredSales.length > 0 ? (
          filteredSales.map((sales, itemIndex) => {
            const { transactionID, dateTime, transactionAmount } = sales;
            return (
              <li className={styles.productListItem} key={transactionID}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      width: "100%",
                    }}
                  >
                    <p>Transaction ID: {transactionID}</p>
                    <p>Date: {dateTime.toDate().toLocaleDateString()}</p>
                    <p>
                      Time:{" "}
                      {dateTime.toDate().toLocaleString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </p>
                    <p>Transaction Amount: ${transactionAmount}</p>
                  </div>
                  {/* Additional details for expanded sales item */}
                  <div style={{ width: "100%" }}>
                    {expandedItemIndex === itemIndex && (
                      <div className={styles.details}>
                        {sales.salesItems.map((item, index) => (
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              width: "100%",
                              margin: "20px 0",
                            }}
                            key={index}
                          >
                            <p>Product ID: {item.productId}</p>
                            <p>Product Name: {item.productName}</p>
                            <p>Selling Price: ${item.sellingPrice}</p>
                            <p>Quantity: {item.quantity}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Toggle button */}
                  <button
                    style={{
                      display: "block",
                      width: "315px",
                      padding: "10px 10px 0",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      fontSize: "100%",
                    }}
                    onClick={() => handleToggleItem(itemIndex)}
                  >
                    {expandedItemIndex === itemIndex ? (
                      <u>Hide Details</u>
                    ) : (
                      <u>+ Show More</u>
                    )}
                  </button>
                </div>
              </li>
            );
          })
        ) : (
          <>
            <br></br>
            <p style={{ color: "black" }}>
              There are no transactions recorded.
            </p>
          </>
        )}
      </ul>
    </>
  );
}
