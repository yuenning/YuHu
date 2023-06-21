import { useEffect, useState } from "react";
import { useAuthContext } from "../../../hooks/useAuthContext";
import { useCollection } from "../../../hooks/useCollection";

// styles
import styles from "../Home.module.css";

export default function ExpiringList() {
  const [products, setProducts] = useState([]);
  const [productsError, setProductsError] = useState(null);
  const [nearExpiryBatches, setNearExpiryBatches] = useState([]);

  const { user } = useAuthContext();
  const { documents: productData, error: productDataError } = useCollection(
    `users/${user?.uid}/products`
  );

  useEffect(() => {
    if (productDataError) {
      setProductsError(productDataError);
    } else {
      setProducts(productData || []);
    }
  }, [productData, productDataError]);

  useEffect(() => {
    // Check for expiry date < 5 days
    const checkNearExpiryItems = () => {
      const today = new Date();
      const fiveDaysFromNow = new Date();
      fiveDaysFromNow.setDate(today.getDate() + 5);

      if (products) {
        const expiringBatches = products.reduce((acc, product) => {
          const batchDetails = product.batchDetails || [];
          const expiringBatchDetails = batchDetails.filter((batch) => {
            const expiryDate =
              batch.expiryDate && batch.expiryDate.toDate
                ? batch.expiryDate.toDate() // Convert to Date object
                : null;
            if (expiryDate && !isNaN(expiryDate)) {
              const differenceInTime = expiryDate.getTime() - today.getTime();
              const differenceInDays = differenceInTime / (1000 * 3600 * 24);
              return differenceInDays < 5;
            }
            return false;
          });

          if (expiringBatchDetails.length > 0) {
            const expiringProduct = {
              ...product,
              batchDetails: expiringBatchDetails,
            };
            acc.push(expiringProduct);
          }

          return acc;
        }, []);

        setNearExpiryBatches(expiringBatches);
      }
    };

    checkNearExpiryItems();
  }, [products]);

  if (productsError) {
    return <p>Error: {productsError}</p>;
  }

  // ...

  return (
    <div className={styles.carousel}>
      <h3>Expiring Products</h3>
      {nearExpiryBatches.length > 0 ? (
        <div>
          {nearExpiryBatches.map((product) => (
            <ul key={product.productId} className={styles.carouselContainer}>
              {product.batchDetails.map((batch, batchIndex) => (
                <div key={batchIndex} className={styles.carouselItem}>
                  <strong>
                    {product.productId} | {product.productName}
                  </strong>
                  <p>
                    {batch.batchId
                      ? `Batch ID: ${batch.batchId}`
                      : `Batch Index: ${batchIndex + 1}`}
                  </p>
                  <p>Quantity: {batch.quantity}</p>
                  <p>
                    Expiry Date:{" "}
                    {batch.expiryDate.toDate().toLocaleDateString()}
                  </p>
                </div>
              ))}
            </ul>
          ))}
        </div>
      ) : (
        <p>No batches near expiry.</p>
      )}
    </div>
  );
}
