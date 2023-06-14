import { useState, useEffect } from "react";
import { useFirestore } from "../../hooks/useFirestore";

export default function SalesForm({ uid }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [productName, setProductName] = useState("");
  const [productID, setProductID] = useState("");
  const [quantity, setQuantity] = useState("");

  const { addDocument, response } = useFirestore("sales");

  const handleSubmit = (e) => {
    e.preventDefault();
    addDocument({
      uid,
      date,
      time,
      productName,
      productID,
      quantity,
    });
  };

  // Reset the form fields
  useEffect(() => {
    if (response && response.success) {
      setDate("");
      setTime("");
      setProductName("");
      setProductID("");
      setQuantity("");
    }
  }, [response]);

  return (
    <>
      <h3>Sales Details</h3>
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
          <span>Quantity:</span>
          <input
            type="number"
            required
            onChange={(e) => setQuantity(e.target.value)}
            value={quantity}
          />
        </label>
        <button type="submit">Add Sales</button>
      </form>
    </>
  );
}
