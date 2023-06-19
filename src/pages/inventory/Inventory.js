import React, { useEffect, useState } from "react";
import { useCollection } from "../../hooks/useCollection";
import { useAuthContext } from "../../hooks/useAuthContext";

// styles
import styles from "./Inventory.module.css";

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [productsError, setProductsError] = useState(null);
  const [expandedProductIndex, setExpandedProductIndex] = useState(null);

  // Fetch products in products collection
  const { user } = useAuthContext();
  const { documents: productData, error: productDataError } = useCollection(
    `users/${user.uid}/products`
  );

  useEffect(() => {
    if (productDataError) {
      setProductsError(productDataError);
    } else {
      setProducts(productData || []);
    }
  }, [productData, productDataError]);

  const handleToggleBatch = (productIndex) => {
    if (expandedProductIndex === productIndex) {
      setExpandedProductIndex(null);
    } else {
      setExpandedProductIndex(productIndex);
    }
  };

  if (productsError) {
    return <p>Error: {productsError}</p>;
  }

  return (
    <>
      <div className={styles.container}>
        <h3>Products List</h3>
        <ul className={styles.transactions}>
          {products.map((product, productIndex) => (
            <li key={product.productId}>
              <div>
                <p>Product ID: {product.productId}</p>
                <p>Product Name: {product.productName}</p>
                <p>Total Quantity: {product.totalQuantity}</p>
              </div>
              {expandedProductIndex === productIndex &&
                product.batchDetails.map((batch, batchIndex) => (
                  <div key={batchIndex}>
                    <p>{`Batch ${batchIndex + 1}`}</p>
                    <p>{batch.batchId ? `Batch ID: ${batch.batchId}` : ""}</p>
                    <p>Quantity: {batch.quantity}</p>
                    <p>
                      Expiry Date:{" "}
                      {batch.expiryDate.toDate().toLocaleDateString()}
                    </p>
                    <p>Cost Price: {batch.costPrice}</p>
                  </div>
                ))}
              <button onClick={() => handleToggleBatch(productIndex)}>
                {expandedProductIndex === productIndex
                  ? "Hide Details"
                  : "Show More"}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
