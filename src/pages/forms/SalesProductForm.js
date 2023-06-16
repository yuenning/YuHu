import { useState } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import { FaTimes } from "react-icons/fa";
import { projectFirestore } from "../../firebase/config";

export default function SalesProductForm({ uid, onSubmit, onDelete }) {
  const [productId, setProductId] = useState("");
  const [productName, setProductName] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [transactionId, setTransactionId] = useState("");

  // Retrieve the user from the authentication context
  const { user } = useAuthContext();

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Form Data:", {
      productId,
      productName,
      sellingPrice,
      quantity,
      transactionId,
    });

    const productData = {
      productId,
      productName,
      sellingPrice: parseFloat(sellingPrice),
      quantity: parseInt(quantity),
      transactionId,
    };

    // Save the product data to Firebase
    projectFirestore
      .collection(`users/${user.uid}/salesitems`)
      .add(productData)
      .then(() => {
        console.log("Product saved successfully!");
        console.log(productData);
        onSubmit(productData);
        // Reset the form
        setProductId("");
        setProductName("");
        setSellingPrice("");
        setQuantity("");
        setTransactionId("");
      })
      .catch((error) => {
        console.error("Error saving product: ", error);
      });
  };

  return (
    <>
      <h3 style={{ display: "flex", alignItems: "center" }}>
        Restock Product Details
        <button
          style={{
            background: "none",
            color: "#777",
            border: "2px solid black",
            padding: "2px",
            marginLeft: "10px",
            textAlign: "center",
            lineHeight: "1",
            fontSize: "0.9em",
            cursor: "pointer",
            width: "30px",
            height: "30px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          onClick={onDelete}
        >
          <FaTimes
            style={{
              margin: "0",
              color: "black",
              fontSize: "1.2em",
            }}
          />
        </button>
      </h3>
      <div style={{ paddingBottom: "20px" }}>
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column" }}
        >
          <div style={{ width: "45%" }}>
            <label>
              <span>Transaction ID:</span>
              <input
                name="transactionId"
                type="number"
                required
                onChange={(e) => setTransactionId(e.target.value)}
                value={transactionId}
              />
            </label>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ width: "45%" }}>
              <label>
                <span>Product Name:</span>
                <input
                  name="productName"
                  type="text"
                  required
                  onChange={(e) => setProductName(e.target.value)}
                  value={productName}
                />
              </label>
            </div>
            <div style={{ width: "45%" }}>
              <label>
                <span>Product ID:</span>
                <input
                  name="productId"
                  type="text"
                  required
                  onChange={(e) => setProductId(e.target.value)}
                  value={productId}
                />
              </label>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ width: "45%" }}>
              <label>
                <span>Quantity:</span>
                <input
                  name="productQuantity"
                  type="number"
                  required
                  onChange={(e) => setQuantity(e.target.value)}
                  value={quantity}
                />
              </label>
            </div>
            <div style={{ width: "45%" }}>
              <label>
                <span>Selling Price:</span>
                <input
                  name="sellingPrice"
                  type="number"
                  required
                  onChange={(e) => setSellingPrice(e.target.value)}
                  value={sellingPrice}
                />
              </label>
            </div>
          </div>
          <div style={{ alignSelf: "flex-end", marginTop: "10px" }}>
            <button
              type="submit"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "auto",
                padding: "10px",
                color: "white",
                border: "2px solid white",
                borderRadius: "5px",
                fontSize: "100%",
              }}
            >
              Save Product
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

/*
import { useState, useEffect } from "react";
import { useFirestore } from "../../hooks/useFirestore";
import { FaTimes } from "react-icons/fa";
import { useAuthContext } from "../../hooks/useAuthContext";

export default function SalesProductForm({ uid, onSubmit, onDelete }) {
  const [productName, setProductName] = useState("");
  const [productID, setProductID] = useState("");
  const [quantity, setQuantity] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");

  // to add the input into user-segregated firestore
  const { user } = useAuthContext();
  const { addDocument, response } = useFirestore(
    `users/${user.uid}/salesitems`
  );
  const handleSubmit = (e) => {
    e.preventDefault();

    addDocument({
      uid,
      productName,
      productID,
      quantity,
      sellingPrice,
    });
  };

  // reset the form fields
  useEffect(() => {
    if (response.success) {
      setProductName("");
      setProductID("");
      setQuantity("");
      setSellingPrice("");
    }
  }, [response.success]);

  return (
    <>
      <h3 style={{ display: "flex", alignItems: "center" }}>
        Sales Product Details
        <button
          style={{
            background: "none",
            color: "#777",
            border: "2px solid black",
            padding: "2px",
            marginLeft: "10px",
            textAlign: "center",
            lineHeight: "1",
            fontSize: "0.9em",
            cursor: "pointer",
            width: "30px",
            height: "30px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          onClick={onDelete}
        >
          <FaTimes
            style={{
              margin: "0",
              color: "black",
              fontSize: "1.2em",
            }}
          />
        </button>
      </h3>
      <div style={{ paddingBottom: "20px" }}>
        <form onSubmit={handleSubmit}>
          <label>
            <span>Product Name:</span>
            <input
              name="productName"
              type="text"
              required
              onChange={(e) => setProductName(e.target.value)}
              value={productName}
            />
          </label>
          <label>
            <span>Product ID:</span>
            <input
              name="productID"
              type="text"
              required
              onChange={(e) => setProductID(e.target.value)}
              value={productID}
            />
          </label>
          <label>
            <span>Quantity:</span>
            <input
              name="productQuantity"
              type="number"
              required
              onChange={(e) => setQuantity(e.target.value)}
              value={quantity}
            />
          </label>
          <label>
            <span>Selling Price:</span>
            <input
              name="sellingPrice"
              type="number"
              required
              onChange={(e) => setSellingPrice(e.target.value)}
              value={sellingPrice}
            />
          </label>
        </form>
      </div>
    </>
  );
}
*/
