import { useState, useEffect } from "react";
import { useFirestore } from "../../hooks/useFirestore";

export default function SalesForm({ uid }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [productName, setProductName] = useState("");
  const [productID, setProductID] = useState("");
  const [type, setType] = useState("");
  const [price, setPrice] = useState("");

  const { addDocument, response } = useFirestore("price");

  const handleSubmit = (e) => {
    e.preventDefault();
    addDocument({
      uid,
      date,
      time,
      productName,
      productID,
      type,
      price
    });
  };

  // Reset the form fields
  useEffect(() => {
    if (response && response.success) {
      setDate("");
      setTime("");
      setProductName("");
      setProductID("");
      setType("");
      setPrice("");
    }
  }, [response]);

  return (
    <>
      <h3>Price Change Details</h3>
      <form onSubmit={handleSubmit}>
      <label>
          <span>Date:</span>
          <input
            type="date"
            required
            onChange={(e) => setDate(e.target.value)}
            value={date}
          />
        </label>
        <label>
          <span>Time:</span>
          <input
            type="time"
            required
            onChange={(e) => setTime(e.target.value)}
            value={time}
          />
        </label>
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
            <span>Type:</span>
            <select
                required
                onChange={(e) => setType(e.target.value)}
                value={type}
            >
                <option value="">Select an option</option>
                <option value="product1">Cost Price</option>
                <option value="product2">Selling Price</option>
            </select>
        </label>
        <label>
          <span>New Price:</span>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            required
            onChange={(e) => setPrice(e.target.value)}
            value={price}
          />
        </label>
        <button type="submit">Add Price</button>
      </form>
    </>
  );
}
