import React, { useEffect, useState } from "react";
import { useCollection } from "../../../hooks/useCollection";
import { useAuthContext } from "../../../hooks/useAuthContext";

// styles
import styles from "../Home.module.css";

export default function QuantityLowList() {
  const [products, setProducts] = useState([]);
  const [productsError, setProductsError] = useState(null);
  const [lowQuantityProducts, setLowQuantityProducts] = useState([]);

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
    // Filter products with total quantity < 10
    const filterLowQuantityProducts = () => {
      const lowQuantity = products.filter((product) => {
        const totalQuantity = product.totalQuantity || 0;
        return totalQuantity < 10;
      });
      setLowQuantityProducts(lowQuantity);
    };

    filterLowQuantityProducts();
  }, [products]);

  if (productsError) {
    return <p>Error: {productsError}</p>;
  }

  return (
    <div className={styles.carousel}>
      <h3>Low Quantity Products</h3>
      {lowQuantityProducts.length > 0 ? (
        <ul className={styles.carouselContainer}>
          {lowQuantityProducts.map((product) => (
            <li key={product.productId} className={styles.carouselItem}>
              <div>
                <strong>
                  {product.productId} | {product.productName}
                </strong>
              </div>
              <div>Quantity Left: {product.totalQuantity}</div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No low quantity products found.</p>
      )}
    </div>
  );
}

/*
  const [lowQuantityItems, setLowQuantityItems] = useState([]);

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
      const mergedQuantities = calculateMergedQuantities(restocks, sales);
      const lowQuantityItems = filterLowQuantityItems(mergedQuantities);
      setLowQuantityItems(lowQuantityItems);
    }
  }, [restocks, sales, restocksError, salesError]);

  const calculateMergedQuantities = (restocks, sales) => {
    const mergedQuantities = {};

    restocks.forEach((restock) => {
      const productId = restock.productId;
      const quantity = restock.quantity;

      if (productId && quantity) {
        mergedQuantities[productId] =
          (mergedQuantities[productId] || 0) + quantity;
      }
    });

    sales.forEach((sale) => {
      const productId = sale.productId;
      const quantity = sale.quantity;

      if (productId && quantity) {
        mergedQuantities[productId] =
          (mergedQuantities[productId] || 0) - quantity;
      }
    });

    return mergedQuantities;
  };

  const filterLowQuantityItems = (mergedQuantities) => {
    return Object.entries(mergedQuantities).filter(([productId, quantity]) => {
      return quantity < 10;
    });
  };

  return (
    <div className={styles.carousel}>
      <h3>Low Quantity Items</h3>
      {lowQuantityItems.length > 0 ? (
        <ul>
          {lowQuantityItems.map(([productId, quantity]) => (
            <li key={productId} className={styles.carouselItem}>
              <div className={styles.name}>
                <strong>{productId}</strong>
              </div>
              <p className={styles.amount}>Quantity Left: {quantity}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No low quantity items.</p>
      )}
    </div>
  );
*/
