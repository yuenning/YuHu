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
            <li className={styles.productListItem} key={product.productId}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: "100%"}}>
              <div style={{ display: "flex", justifyContent: "space-between", width: "100%"}}>
                <p>Product ID: {product.productId}</p>
                <p>Product Name: {product.productName}</p>
                <p>Total Quantity: {product.totalQuantity}</p>
              </div>
              {expandedProductIndex === productIndex &&
                product.batchDetails.map((batch, batchIndex) => (
                  <div style={{ width: "100%", margin: "20px 0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", width: "100%"}} key={batchIndex}>
                    <p style={{ flex: "1" }}>{`Batch ${batchIndex + 1}`}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', flex: "1" }}>
                    <p>{batch.batchId ? `Batch ID: ${batch.batchId}` : ""}</p>
                    <p>
                      Expiry Date:{" "}
                      {batch.expiryDate.toDate().toLocaleDateString()}
                    </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', flex: "1" }}>
                    <p style = {{ textAlign: "right" }}>Quantity: {batch.quantity}</p>
                    <p style = {{ textAlign: "right" }}>Cost Price: ${batch.costPrice}</p>
                    </div>
                  </div>
                  </div>
                ))}
              <button style= {{ 
            display: 'block', 
            width: '315px', 
            padding: '10px 10px 0', 
            color: 'white', 
            border: 'none',
            borderRadius: '5px', 
            fontSize: '100%' }} className={styles.showMoreButton} onClick={() => handleToggleBatch(productIndex)}>
                {expandedProductIndex === productIndex
                  ? <u>Hide Details</u>
                  : <u>+ Show More</u>}
              </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
