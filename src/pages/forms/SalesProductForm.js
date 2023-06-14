import { useState, useEffect } from "react";
import { useFirestore } from "../../hooks/useFirestore";

export default function SalesProductForm({ uid }) {
  const [productName, setProductName] = useState("");
  const [productID, setProductID] = useState("");
  const [quantity, setQuantity] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");

  const { addDocument, response } = useFirestore("SalesItems");

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
      <h3>Sales Product Details</h3>
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
          <span>Selling Price:</span>
          <input
            type="number"
            required
            onChange={(e) => setSellingPrice(e.target.value)}
            value={sellingPrice}
          />
        </label>
      </form>
    </>
  );
}
