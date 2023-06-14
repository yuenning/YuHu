import { useState, useEffect } from "react";
import { useFirestore } from "../../hooks/useFirestore";

export default function RestockProductForm({ uid }) {
  const [productName, setProductName] = useState("");
  const [productID, setProductID] = useState("");
  const [quantity, setQuantity] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [costPrice, setCostPrice] = useState("");

  const { addDocument, response } = useFirestore("RestockItems");

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
      <h3>Restock Product Details</h3>
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
    </>
  );
}
