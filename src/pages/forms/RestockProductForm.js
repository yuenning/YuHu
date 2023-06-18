import { useState } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import { FaTimes } from "react-icons/fa";
import { projectFirestore, timestamp } from "../../firebase/config";

export default function RestockProductForm({ uid, onSubmit, onDelete }) {
  const [productId, setProductId] = useState("");
  const [productName, setProductName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [transactionId, setTransactionId] = useState("");

  // Retrieve the user from the authentication context
  const { user } = useAuthContext();

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Form Data:", {
      productId,
      productName,
      expiryDate,
      costPrice,
      quantity,
      transactionId,
    });

    const productData = {
      productId,
      productName,
      expiryDate: timestamp.fromDate(new Date(expiryDate)),
      costPrice: parseFloat(costPrice),
      quantity: parseInt(quantity),
      transactionId,
    };

    // Save the product data to Firebase
    projectFirestore
      .collection(`users/${user.uid}/restockitems`)
      .add(productData)
      .then(() => {
        console.log("Product saved successfully!");
        console.log(productData);
        onSubmit(productData);
        // Reset the form
        setProductId("");
        setProductName("");
        setExpiryDate("");
        setCostPrice("");
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
          <div style={{ display: "flex", justifyContent: "space-between" }}>
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
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
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
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ width: "45%" }}>
              <label>
                <span>Expiry Date:</span>
                <input
                  name="expiryDate"
                  type="date"
                  required
                  onChange={(e) => setExpiryDate(e.target.value)}
                  value={expiryDate}
                />
              </label>
            </div>
            <div style={{ width: "45%" }}>
              <label>
                <span>Cost Price:</span>
                <input
                  name="costPrice"
                  type="number"
                  required
                  onChange={(e) => setCostPrice(e.target.value)}
                  value={costPrice}
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

/* PREVIOUS FORM HANDLING
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
  */
