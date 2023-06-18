import { useState, useEffect } from "react";
import { useFirestore } from "../../hooks/useFirestore";
import { FaTimes } from "react-icons/fa";
import { useAuthContext } from "../../hooks/useAuthContext";

export default function RestockProductForm({ uid, onSubmit, onDelete }) {
  const [productName, setProductName] = useState("");
  const [productID, setProductID] = useState("");
  const [quantity, setQuantity] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [costPrice, setCostPrice] = useState("");

  // to add the input into user-segregated firestore
  const { user } = useAuthContext();
  const { addDocument, response } = useFirestore(
    `users/${user.uid}/restockitems`
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    addDocument({
      uid,
      productName,
      productID,
      quantity,
      expiryDate,
      costPrice,
    });
  };

  // reset the form fields
  useEffect(() => {
    if (response.success) {
      setProductName("");
      setProductID("");
      setQuantity("");
      setExpiryDate("");
      setCostPrice("");
    }
  }, [response.success]);

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
        <form onSubmit={handleSubmit}>
          <label>
            <span>Product Name:</span>
            <input
              type="text"
              required
              onChange={(e) => setProductName(e.target.value)}
              value={productName}
            />
          </label>
          <label>
            <span>Product ID:</span>
            <input
              type="text"
              required
              onChange={(e) => setProductID(e.target.value)}
              value={productID}
            />
          </label>
          <label>
            <span>Quantity:</span>
            <input
              type="number"
              required
              onChange={(e) => setQuantity(e.target.value)}
              value={quantity}
            />
          </label>
          <label>
            <span>Expiry Date:</span>
            <input
              type="date"
              required
              onChange={(e) => setExpiryDate(e.target.value)}
              value={expiryDate}
            />
          </label>
          <label>
            <span>Cost Price:</span>
            <input
              type="number"
              required
              onChange={(e) => setCostPrice(e.target.value)}
              value={costPrice}
            />
          </label>
        </form>
      </div>
    </>
  );
}
