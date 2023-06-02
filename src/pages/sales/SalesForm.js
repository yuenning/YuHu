import { useState, useEffect } from "react";
import { useFirestore } from "../../hooks/useFirestore";

export default function SalesForm({ uid }) {
  const [productID, setProductID] = useState("");
  const [batchID, setBatchID] = useState("");
  const [quantity, setQuantity] = useState("");

  const { addDocument, response } = useFirestore("sales");

  const handleSubmit = (e) => {
    e.preventDefault();
    addDocument({
      uid,
      productID,
      batchID,
      quantity,
    });
  };

  // Reset the form fields
  useEffect(() => {
    if (response && response.success) {
      setProductID("");
      setBatchID("");
      setQuantity("");
    }
  }, [response]);

  return (
    <>
      <h3>Input Sales</h3>
      <form onSubmit={handleSubmit}>
        <label htmlFor="productID">
          <span>Product ID:</span>
          <input
            type="text"
            required
            id="productID"
            onChange={(e) => setProductID(e.target.value)}
            value={productID}
          />
        </label>
        <label htmlFor="batchID">
          <span>Batch ID:</span>
          <input
            type="text"
            required
            id="batchID"
            onChange={(e) => setBatchID(e.target.value)}
            value={batchID}
          />
        </label>
        <label htmlFor="quantity">
          <span>Quantity:</span>
          <input
            type="number"
            required
            id="quantity"
            onChange={(e) => setQuantity(e.target.value)}
            value={quantity}
          />
        </label>
        <button type="submit">Add Sales</button>
      </form>
    </>
  );
}
