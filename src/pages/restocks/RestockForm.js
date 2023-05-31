import { useState, useEffect } from "react";
import { useFirestore } from "../../hooks/useFirestore";

export default function RestockForm({ uid }) {
  const [productName, setProductName] = useState("");
  const [productID, setProductID] = useState("");
  const [batchID, setBatchID] = useState("");
  const [quantity, setQuantity] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [costPrice, setCostPrice] = useState("");

  const { addDocument, response } = useFirestore("restocks");

  const handleSubmit = (e) => {
    e.preventDefault();

    addDocument({
      uid,
      productName,
      productID,
      batchID,
      quantity,
      expiryDate,
      sellingPrice,
      costPrice,
    });
  };

  // reset the form fields
  useEffect(() => {
    if (response.success) {
      setProductName("");
      setProductID("");
      setBatchID("");
      setQuantity("");
      setExpiryDate("");
      setSellingPrice("");
      setCostPrice("");
    }
  }, [response.success]);

  return (
    <>
      <h3>Input Restocks</h3>
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
          <span>Selling Price:</span>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            required
            onChange={(e) => setSellingPrice(e.target.value)}
            value={sellingPrice}
          />
        </label>
        <label>
          <span>Cost Price:</span>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            required
            onChange={(e) => setCostPrice(e.target.value)}
            value={costPrice}
          />
        </label>

        <button>Add Restock</button>
      </form>
    </>
  );
}
