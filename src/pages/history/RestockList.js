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
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (restockDataError || restockItemsDataError) {
      console.log("Error retrieving restock data:", restockDataError);
      console.log(
        "Error retrieving restock items data:",
        restockItemsDataError
      );
    } else {
      const sortedRestocks = restockData
        ?.map((restock) => ({
          ...restock,
          restockItems: restockItemsData.filter(
            (item) => item.transactionID === restock.transactionID
          ),
        }))
        .sort((a, b) => {
          const dateA = new Date(a.date + " " + a.time);
          const dateB = new Date(b.date + " " + b.time);
          return dateB - dateA; // Sort in descending order (latest first)
        });

      setRestocks(sortedRestocks || []);
    }
  }, [restockData, restockItemsData, restockDataError, restockItemsDataError]);

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

  if (!restocks) {
    return <p>Loading...</p>;
  }

  // Filter the restocks based on search query
  const filteredRestocks = restocks.filter((restock) => {
    if (searchQuery.trim() === "") {
      return true; // If search query is empty, show all restocks
    }
    const query = searchQuery.toLowerCase();
    return (
      restock.transactionID.toLowerCase().includes(query) ||
      restock.date.toLowerCase().includes(query) ||
      restock.time.toLowerCase().includes(query)
    );
  });

  return (
    <>
      <h3>Past Restock Transactions</h3>
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
        {filteredRestocks.length > 0 ? (
          filteredRestocks.map((restock, itemIndex) => {
            const { transactionID, dateTime, transactionAmount } = restock;
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
                  {/* Additional details for expanded restock item */}
                  <div style={{ width: "100%" }}>
                    {expandedItemIndex === itemIndex && (
                      <div className={styles.details}>
                        {restock.restockItems.map((item, index) => (
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              width: "100%",
                              margin: "20px 0",
                            }}
                            key={index}
                          >
                            <p style={{ flex: "1" }}>
                              Product ID: {item.productId}
                            </p>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                flex: "1",
                              }}
                            >
                              <p>Batch ID: {item.batchId}</p>
                              <p>
                                Expiry Date:{" "}
                                {item.expiryDate.toDate().toLocaleDateString()}
                              </p>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                flex: "1",
                              }}
                            >
                              <p style={{ textAlign: "right" }}>
                                Quantity: {item.quantity}
                              </p>
                              <p style={{ textAlign: "right" }}>
                                Cost Price: $
                                {parseFloat(item.costPrice).toFixed(2)}
                              </p>
                            </div>
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
