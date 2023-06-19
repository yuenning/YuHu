import React, { useEffect, useState } from "react";
import { useCollection } from "../../hooks/useCollection";
import { useAuthContext } from "../../hooks/useAuthContext";

// styles
import styles from "./Inventory.module.css";

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [productsError, setProductsError] = useState(null);

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

  if (productsError) {
    return <p>Error: {productsError}</p>;
  }

  return (
    <div className={styles.container}>
      <h3>Products List</h3>
      <ul className={styles.transactions}>
        {products.map((product) => (
          <li key={product.productId}>
            <p>{product.productId} ||</p>
            <p>{product.productName} ||</p>
            <p>{product.totalQuantity} ||</p>
            {product.batchDetails.map((batch, index) => (
              <div key={index}>
                <p>Batch {index + 1}:</p>
                <p>Quantity: {batch.quantity}</p>
                <p>Expiry Date: {batch.expiryDate}</p>
                <p>Cost Price: {batch.costPrice}</p>
              </div>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}
