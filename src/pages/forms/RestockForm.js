import { useState, useEffect } from "react";
import { projectFirestore, timestamp } from "../../firebase/config";
import { useAuthContext } from "../../hooks/useAuthContext";

// Styles
import { FaTimes } from "react-icons/fa";
export default function RestockForm() {
  const { user } = useAuthContext();
  const [restockForms, setRestockForms] = useState({
    date: "",
    time: "",
    transactionID: "",
    transactionAmount: 0,
  });
  const [productForms, setProductForms] = useState([
    {
      productId: "",
      productName: "",
      batchId: "",
      quantity: "",
      expiryDate: "",
      costPrice: "",
    },
  ]);

  const handleRestockChange = (field, value) => {
    setRestockForms((prevForms) => ({ ...prevForms, [field]: value }));
  };

  const handleProductChange = async (index, field, value) => {
    const updatedForms = [...productForms];
    updatedForms[index] = {
      ...updatedForms[index],
      [field]: value,
    };

    if (field === "productId") {
      const productId = value;

      // Fetch the selling price and transaction ID from restockitems collection
      const restockItemsSnapshot = await projectFirestore
        .collection(`users/${user.uid}/restockitems`)
        .where("productId", "==", productId)
        .orderBy("transactionID", "desc")
        .limit(1)
        .get();

      if (!restockItemsSnapshot.empty) {
        const restockItemData = restockItemsSnapshot.docs[0].data();
        const costPrice = restockItemData.costPrice || "";
        const productName = restockItemData.productName || "";

        const transactionId = restockItemData.transactionID;
        const restocksSnapshot = await projectFirestore
          .collection(`users/${user.uid}/restocks`)
          .where("transactionID", "==", transactionId)
          .limit(1)
          .get();

        if (!restocksSnapshot.empty) {
          const restocksData = restocksSnapshot.docs[0].data();
          const latestTransactionId = restocksData.transactionID;

          const latestRestockItemsSnapshot = await projectFirestore
            .collection(`users/${user.uid}/restockitems`)
            .where("transactionID", "==", latestTransactionId)
            .where("productId", "==", productId)
            .limit(1)
            .get();

          if (!latestRestockItemsSnapshot.empty) {
            const latestRestockItemData =
              latestRestockItemsSnapshot.docs[0].data();
            const latestCostPrice = latestRestockItemData.costPrice || "";
            updatedForms[index].costPrice = latestCostPrice;
          }
        }

        updatedForms[index].costPrice = costPrice;
        updatedForms[index].productName = productName;
      }
    }

    setProductForms(updatedForms);
  };

  const addProductForm = () => {
    setProductForms((prevForms) => [
      ...prevForms,
      {
        productId: "",
        productName: "",
        batchId: "",
        quantity: "",
        expiryDate: "",
        costPrice: "",
      },
    ]);
  };

  const removeProductForm = (index) => {
    const updatedForms = [...productForms];
    updatedForms.splice(index, 1);
    setProductForms(updatedForms);
  };

  const convertToTimestamp = (dateString) => {
    const date = new Date(dateString);
    if (!isNaN(date)) {
      return timestamp.fromDate(date);
    }
    return null;
  };

  useEffect(() => {
    const date = convertToTimestamp(restockForms.date);
    if (date) {
      setRestockForms((prevForms) => ({ ...prevForms, date }));
    }
  }, [restockForms.date]);

  const [formErrors, setFormErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const errors = [];

    // Validate restock forms
    if (restockForms.date === "") {
      errors.push("Date field cannot be empty");
    }
    if (restockForms.time === "") {
      errors.push("Time field cannot be empty");
    }
    if (restockForms.transactionID === "") {
      errors.push("Restock ID field cannot be empty");
    }

    // Validate product forms
    productForms.forEach((form, index) => {
      if (form.productId === "") {
        errors.push(`Product ID field cannot be empty (Product ${index + 1})`);
      }
      if (form.productName === "") {
        errors.push(
          `Product Name field cannot be empty (Product ${index + 1})`
        );
      }
      if (form.quantity === "") {
        errors.push(`Quantity field cannot be empty (Product ${index + 1})`);
      }
      if (form.costPrice === "") {
        errors.push(`Cost Price field cannot be empty (Product ${index + 1})`);
      }
      if (form.expiryDate === "") {
        errors.push(`Expiry Date field cannot be empty (Product ${index + 1})`);
      }
    });

    return errors;
  };

  const handleSubmit = async () => {
    const errors = validateForm();

    if (errors.length === 0) {
      setIsSubmitting(true);

      // Save data to Firebase
      const restockData = {
        ...restockForms,
        userID: user.uid,
      };

      const batch = projectFirestore.batch();

      // Create a new restock document
      const restockRef = projectFirestore
        .collection(`users/${user.uid}/restocks`)
        .doc();
      batch.set(restockRef, restockData);

      // Create restock items documents
      productForms.forEach((form) => {
        const restockItemData = {
          ...form,
          transactionID: restockForms.transactionID,
          userID: user.uid,
          timestamp: timestamp.now(),
        };
        const restockItemRef = projectFirestore
          .collection(`users/${user.uid}/restockitems`)
          .doc();
        batch.set(restockItemRef, restockItemData);
      });

      // Commit the batch write
      await batch.commit();

      // Reset the forms
      setRestockForms({
        date: "",
        time: "",
        transactionID: "",
        transactionAmount: 0,
      });
      setProductForms([
        {
          productId: "",
          productName: "",
          batchId: "",
          quantity: "",
          expiryDate: "",
          costPrice: "",
        },
      ]);

      setIsSubmitting(false);
    } else {
      setFormErrors(errors);
    }
  };

  return (
    <div>
      {formErrors.length > 0 && (
        <div style={{ color: "red" }}>
          {formErrors.map((error, index) => (
            <p key={index}>{error}</p>
          ))}
        </div>
      )}
      {/* Restock Form */}
      <br></br>
      <h3 style={{ display: "flex", alignItems: "center" }}>
        {" "}
        Restock Transaction Details
      </h3>
      <div style={{ paddingBottom: "20px" }}>
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column" }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ width: "45%" }}>
              <label htmlFor="date">Date:</label>
              <input
                type="date"
                id="date"
                value={restockForms.date}
                onChange={(e) => handleRestockChange("date", e.target.value)}
              />
            </div>
            <div style={{ width: "45%" }}>
              <label htmlFor="time">Time:</label>
              <input
                type="time"
                id="time"
                value={restockForms.time}
                onChange={(e) => handleRestockChange("time", e.target.value)}
              />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ width: "45%" }}>
              <label htmlFor="transactionID">Restock ID:</label>
              <input
                type="text"
                id="transactionID"
                value={restockForms.transactionID}
                onChange={(e) =>
                  handleRestockChange("transactionID", e.target.value)
                }
              />
            </div>
            {/* Total Transaction Amount */}
            <div style={{ width: "45%" }}>
              <label htmlFor="transactionAmount">
                Total Transaction Amount: ${restockForms.transactionAmount}
              </label>
            </div>
          </div>
        </form>
      </div>

      {/* Product Forms */}
      {productForms.map((form, index) => (
        <div key={index}>
          <br></br>
          <h3 style={{ display: "flex", alignItems: "center" }}>
            {" "}
            Restock Product {index + 1} Details
            {/* Remove Product Form Button */}
            {index > 0 && (
              <button
                type="button"
                onClick={() => removeProductForm(index)}
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
              >
                <FaTimes
                  style={{
                    margin: "0",
                    color: "black",
                    fontSize: "1.2em",
                  }}
                />
              </button>
            )}
          </h3>
          <div style={{ paddingBottom: "20px" }}>
            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ width: "45%" }}>
                  <label htmlFor={`productId${index}`}>Product ID:</label>
                  <input
                    type="text"
                    id={`productId${index}`}
                    value={form.productId}
                    onChange={(e) =>
                      handleProductChange(index, "productId", e.target.value)
                    }
                  />
                </div>
                <div style={{ width: "45%" }}>
                  <label htmlFor={`productName${index}`}>Product Name:</label>
                  <input
                    type="text"
                    id={`productName${index}`}
                    value={form.productName}
                    onChange={(e) =>
                      handleProductChange(index, "productName", e.target.value)
                    }
                  />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ width: "45%" }}>
                  <label htmlFor={`batchId${index}`}>
                    Batch ID (Optional):
                  </label>
                  <input
                    type="text"
                    id={`batchId${index}`}
                    value={form.batchId}
                    onChange={(e) =>
                      handleProductChange(index, "batchId", e.target.value)
                    }
                  />
                </div>
                <div style={{ width: "45%" }}>
                  <label htmlFor={`quantity${index}`}>Quantity:</label>
                  <input
                    type="number"
                    id={`quantity${index}`}
                    value={form.quantity}
                    onChange={(e) =>
                      handleProductChange(index, "quantity", e.target.value)
                    }
                  />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ width: "45%" }}>
                  <label htmlFor={`costPrice${index}`}>Cost Price:</label>
                  <input
                    type="number"
                    id={`costPrice${index}`}
                    value={form.costPrice}
                    onChange={(e) =>
                      handleProductChange(index, "costPrice", e.target.value)
                    }
                  />
                </div>
                <div style={{ width: "45%" }}>
                  <label htmlFor={`expiryDate${index}`}>Expiry Date:</label>
                  <input
                    type="date"
                    id={`expiryDate${index}`}
                    value={form.expiryDate}
                    onChange={(e) =>
                      handleProductChange(index, "expiryDate", e.target.value)
                    }
                  />
                </div>
              </div>
            </form>
          </div>
        </div>
      ))}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Add Product Form Button */}
        <button
          style={{
            display: "block",
            width: "315px",
            padding: "10px",
            color: "black",
            border: "none",
            borderRadius: "5px",
            fontSize: "100%",
          }}
          type="button"
          onClick={addProductForm}
        >
          <u>+ Add Another Product</u>
        </button>

        {/* Submit Button */}
        <button
          style={{
            display: "block",
            width: "315px",
            padding: "10px",
            backgroundColor: "#000000",
            color: "white",
            border: "none",
            borderRadius: "5px",
            fontSize: "100%",
          }}
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          Submit
        </button>
      </div>
    </div>
  );
}
