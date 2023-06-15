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
