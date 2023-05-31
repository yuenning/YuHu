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

  // reset the form fields
  useEffect(() => {
    if (response.success) {
      setProductID("");
      setBatchID("");
      setQuantity("");
    }
  }, [response.success]);

  return (
    <>
      <h3>Input Sales</h3>
      <form onSubmit={handleSubmit}>
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
          <span>Batch ID:</span>
          <input
            type="text"
            required
            onChange={(e) => setBatchID(e.target.value)}
            value={batchID}
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

        <button>Add Sales</button>
      </form>
    </>
  );
}
