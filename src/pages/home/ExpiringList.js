import { useEffect, useState } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useCollection } from "../../hooks/useCollection";

// styles
import styles from "./Home.module.css";

export default function ExpiringList() {
  const [restocks, setRestocks] = useState([]);
  const [restocksError, setRestocksError] = useState(null);
  const [nearExpiryItems, setNearExpiryItems] = useState([]);

  const { user } = useAuthContext();
  const { documents: restocksData, error: restocksDataError } = useCollection(
    `users/${user?.uid}/products`
  );

  useEffect(() => {
    if (restocksDataError) {
      setRestocksError(restocksDataError);
    } else {
      setRestocks(restocksData || []);
    }
  }, [restocksData, restocksDataError]);

  useEffect(() => {
    // Check for expiry date < 5 days
    const checkNearExpiryItems = () => {
      const today = new Date();
      const fiveDaysFromNow = new Date();
      fiveDaysFromNow.setDate(today.getDate() + 5);

      if (restocks) {
        const nearExpiry = restocks.filter((item) => {
          const expiryDate = new Date(item.expiryDate.toDate()); // Convert Firestore timestamp to JavaScript Date
          if (isNaN(expiryDate)) {
            // Skip items with invalid date format
            return false;
          }
          const differenceInTime = expiryDate.getTime() - today.getTime();
          const differenceInDays = differenceInTime / (1000 * 3600 * 24);
          return differenceInDays < 5;
        });

        setNearExpiryItems(nearExpiry);
      }
    };

    checkNearExpiryItems();
  }, [restocks]);

  if (restocksError) {
    return <p>Error: {restocksError}</p>;
  }

  return (
    <div className={styles.carousel}>
      <h3>Near Expiry Items</h3>
      {nearExpiryItems.length > 0 ? (
        <ul>
          {nearExpiryItems.map((item) => (
            <li key={item.productId} className={styles.carouselItem}>
              <div>
                <strong>{item.productName}</strong>
              </div>
              <div>
                Expiry Date: {item.expiryDate.toDate().toLocaleDateString()}
              </div>
              <div>
                Expiring in{" "}
                {Math.ceil(
                  (item.expiryDate.toDate().getTime() - Date.now()) /
                    (1000 * 3600 * 24)
                )}{" "}
                days
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No items near expiry.</p>
      )}
    </div>
  );
}
