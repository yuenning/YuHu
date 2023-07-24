import React, { useEffect, useState } from "react";
import { useCollection } from "../../hooks/useCollection";
import { useAuthContext } from "../../hooks/useAuthContext";

import ExpiredProductsModal from "./ExpiredProductsModal";

// styles
import styles from "./Inventory.module.css";

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [productsError, setProductsError] = useState(null);
  const [expandedProductIndex, setExpandedProductIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [expiredProducts, setExpiredProducts] = useState([]);

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
    const product = filteredProducts[productIndex];
    if (product.totalQuantity > 0) {
      if (expandedProductIndex === productIndex) {
        setExpandedProductIndex(null);
      } else {
        setExpandedProductIndex(productIndex);
      }
    }
  };

  if (productsError) {
    return <p>Error: {productsError}</p>;
  }

  const filteredProducts = products.filter((product) => {
    if (searchQuery.trim() === "") {
      return true; // If search query is empty, show all products
    }
    const query = searchQuery.toLowerCase();
    return (
      product.productName.toLowerCase().includes(query) ||
      product.productId.toLowerCase().includes(query)
    );
  });

  // Expired goods deletion
  const handleOpenConfirmModal = () => {
    // Filter expired batches and set them in the state
    const currentDate = Date.now();
    const expiredBatches = [];

    products.forEach((product) => {
      const expiredBatchesForProduct = product.batchDetails.filter(
        (batch, batchIndex) => {
          return (
            batch.expiryDate &&
            new Date(batch.expiryDate.toDate().toLocaleDateString()) <
              currentDate
          );
        }
      );

      // If there are expired batches for this product, add them to the expiredBatches array
      if (expiredBatchesForProduct.length > 0) {
        expiredBatches.push({
          ...product,
          batchDetails: expiredBatchesForProduct,
        });
      }
    });

    console.log(expiredBatches);

    setExpiredProducts(expiredBatches);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <div className={styles.container}>
        <h3>Products List</h3>
        <div style={{ display: "flex", alignItems: "center" }}>
          <input
            type="text"
            placeholder="Search by product ID or name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: "3 0 70%", // 3/4 of the page
              color: "black",
              border: "1px solid black",
              borderRadius: "5px",
              padding: "10px",
              marginRight: "20px",
            }}
          />
          <button
            style={{
              flex: "1 0 25%", // 1/4 of the page
              padding: "10px",
              backgroundColor: "#000000",
              color: "white",
              border: "none",
              borderRadius: "5px",
              fontSize: "100%",
            }}
            onClick={handleOpenConfirmModal}
          >
            Clear Expired Products
          </button>
        </div>

        <ul className={styles.transactions}>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product, productIndex) => (
              <li className={styles.productListItem} key={product.productId}>
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
                    <p>Product ID: {product.productId}</p>
                    <p>Product Name: {product.productName}</p>
                    <p>Total Quantity: {product.totalQuantity}</p>
                  </div>
                  {expandedProductIndex === productIndex &&
                    product.batchDetails.map((batch, batchIndex) => (
                      <div style={{ width: "100%", margin: "20px 0" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            width: "100%",
                          }}
                          key={batchIndex}
                        >
                          <p style={{ flex: "1" }}>{`Batch ${
                            batchIndex + 1
                          }`}</p>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              flex: "1",
                            }}
                          >
                            <p>
                              {batch.batchId
                                ? `Batch ID: ${batch.batchId}`
                                : ""}
                            </p>
                            <p>
                              Expiry Date:{" "}
                              {batch.expiryDate.toDate().toLocaleDateString()}
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
                              Quantity: {batch.quantity}
                            </p>
                            <p style={{ textAlign: "right" }}>
                              Cost Price: ${batch.costPrice}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  <button
                    style={{
                      display: "block",
                      width: "315px",
                      padding: "10px 10px 0",
                      color: product.totalQuantity > 0 ? "white" : "red",
                      border: "none",
                      borderRadius: "5px",
                      fontSize: "100%",
                      backgroundColor: "#000000",
                    }}
                    className={styles.showMoreButton}
                    onClick={() => handleToggleBatch(productIndex)}
                  >
                    {product.totalQuantity > 0 ? (
                      expandedProductIndex === productIndex ? (
                        <u>Hide Details</u>
                      ) : (
                        <u>+ Show More</u>
                      )
                    ) : (
                      "Out of Stock"
                    )}
                  </button>
                </div>
              </li>
            ))
          ) : (
            <>
              <br></br>
              <p style={{ color: "black" }}>
                There are no products in your inventory.
              </p>
            </>
          )}
        </ul>
      </div>
      {/* Render the modal only when showModal is true */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ExpiredProductsModal
            products={expiredProducts}
            onClose={handleCloseModal}
          />
        </div>
      )}
    </>
  );
}
