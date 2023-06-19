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
    restockID: "",
    totalAmount: 0, // New field for total transaction amount
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
    setRestockForms({ ...restockForms, [field]: value });
  };

  const handleProductChange = (index, field, value) => {
    const updatedForms = [...productForms];
    updatedForms[index] = {
      ...updatedForms[index],
      [field]: value,
    };
    setProductForms(updatedForms);
  };

  const addProductForm = () => {
    setProductForms([
      ...productForms,
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
    // Calculate and update the total transaction amount
    const totalAmount = productForms.reduce(
      (total, form) => total + form.quantity * form.costPrice,
      0
    );
    setRestockForms({ ...restockForms, totalAmount });
  }, [productForms]);

  const handleSubmit = async () => {
    // Save restock forms to Firebase
    await projectFirestore.collection(`users/${user.uid}/restocks`).add({
      ...restockForms,
      totalAmount: parseFloat(restockForms.totalAmount),
    });

    // Get the restock ID
    const restockId = restockForms.restockID;

    // Update restock items in the restockitems collection
    await Promise.all(
      productForms.map(async (form) => {
        const {
          productId,
          productName,
          quantity,
          batchId,
          expiryDate,
          costPrice,
        } = form;

        const restockItemData = {
          restockId,
          productId,
          productName,
          quantity: parseInt(quantity, 10),
          expiryDate: timestamp.fromDate(new Date(expiryDate)),
          costPrice: parseFloat(costPrice),
          ...(batchId && { batchId }),
        };
        const expiryDateTimestamp = convertToTimestamp(expiryDate);

        if (expiryDateTimestamp) {
          restockItemData.expiryDate = expiryDateTimestamp;
        } else {
          // Handle the case where expiryDate is invalid or empty
          console.error("Invalid expiry date:", expiryDate);
          return;
        }
        await projectFirestore
          .collection(`users/${user.uid}/restockitems`)
          .add(restockItemData);

        // Update the product collection
        const productDocRef = projectFirestore
          .collection(`users/${user.uid}/products`)
          .doc(productId);

        const productDoc = await productDocRef.get();
        if (productDoc.exists) {
          const productData = productDoc.data();
          const currentQuantity = productData.totalQuantity || 0;
          const updatedQuantity =
            parseInt(currentQuantity, 10) + parseInt(quantity, 10);
          const batchDetails = productData.batchDetails || [];
          const currentBatchData = {
            quantity: parseInt(quantity, 10),
            expiryDate: timestamp.fromDate(new Date(expiryDate)),
            costPrice: parseFloat(costPrice),
          };
          if (batchId) {
            currentBatchData.batchId = batchId;
          }
          batchDetails.push(currentBatchData);

          await productDocRef.update({
            totalQuantity: parseInt(updatedQuantity, 10),
            batchDetails,
          });
        } else {
          // Product does not exist, create a new entry
          await productDocRef.set({
            productId,
            productName,
            batchDetails: [
              {
                quantity: parseInt(quantity, 10),
                expiryDate: timestamp.fromDate(new Date(expiryDate)),
                costPrice: parseFloat(costPrice),
              },
            ],
            totalQuantity: parseInt(quantity, 10),
          });
        }
      })
    );

    // Reset forms after submission
    setRestockForms({
      date: "",
      time: "",
      restockID: "",
      totalAmount: 0,
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

    // Display success message
    alert(
      `Successfully recorded!\nRestock Transaction ID: ${restockId}\nTotal Amount: ${restockForms.totalAmount}`
    );
  };

  return (
    <div>
      {/* Restock Form */}
      <h3>Restock Transaction Details</h3>
      <div>
        <label htmlFor="date">Date:</label>
        <input
          type="date"
          id="date"
          value={restockForms.date}
          onChange={(e) => handleRestockChange("date", e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="time">Time:</label>
        <input
          type="time"
          id="time"
          value={restockForms.time}
          onChange={(e) => handleRestockChange("time", e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="restockId">Restock ID:</label>
        <input
          type="text"
          id="restockId"
          value={restockForms.restockID}
          onChange={(e) => handleRestockChange("restockID", e.target.value)}
        />
      </div>
      {/* Total Transaction Amount */}
      <div>
        <label htmlFor="totalAmount">
          Total Transaction Amount: ${restockForms.totalAmount}
        </label>
      </div>

      {/* Product Forms */}
      {productForms.map((form, index) => (
        <div key={index}>
          <br></br>
          <h3>Restock Product {index + 1} Details</h3>
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
          <div>
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
          <div>
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
          <div>
            <label htmlFor={`batchId${index}`}>Batch ID (Optional):</label>
            <input
              type="text"
              id={`batchId${index}`}
              value={form.batchId}
              onChange={(e) =>
                handleProductChange(index, "batchId", e.target.value)
              }
            />
          </div>
          <div>
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
          <div>
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
          <div>
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
      ))}
      {/* Add Product Form Button */}
      <button type="button" onClick={addProductForm}>
        Add Product Form
      </button>

      {/* Submit Button */}
      <button type="button" onClick={handleSubmit}>
        Submit
      </button>
    </div>
  );
}

/* PREVIOUS CODE
import { useState } from "react";
import { projectFirestore } from "../../firebase/config";
import { useAuthContext } from "../../hooks/useAuthContext";
import RestockTransactionForm from "./RestockTransactionForm";
import RestockProductForm from "./RestockProductForm";

export default function RestockForm() {
  const { user } = useAuthContext();

  const [transactionData, setTransactionData] = useState(null);
  const [productData, setProductData] = useState([]);
  const [additionalFormCount, setAdditionalFormCount] = useState(1);

  const handleAddFormClick = () => {
    setAdditionalFormCount((prevCount) => prevCount + 1);
  };

  const handleTransactionSubmit = (data) => {
    setTransactionData(data);
  };

  const handleProductSubmit = (data) => {
    setProductData((prevData) => [...prevData, data]);
  };

  const handleFormSubmit = () => {
    // Save the transaction data to Firestore
    const transactionRef = projectFirestore
      .collection(`users/${user.uid}/restocks`)
      .doc();
    transactionRef
      .set({ ...transactionData })
      .then(() => {
        // Save the product data to Firestore
        const batch = projectFirestore.batch();
        const productsRef = projectFirestore.collection(
          `users/${user.uid}/restockitems`
        );

        productData.forEach((product) => {
          const productRef = productsRef.doc();
          batch.set(productRef, { ...product });
        });

        return batch.commit();
      })
      .then(() => {
        // Reset the form
        setTransactionData(null);
        setProductData([]);
      })
      .catch((error) => {
        console.error("Error saving data: ", error);
      });
  };

  const handleDeleteFormClick = (index) => {
    setAdditionalFormCount((prevCount) => prevCount - 1);
    setProductData((prevData) => prevData.filter((_, i) => i !== index));
  };

  return (
    <div>
      <RestockTransactionForm onSubmit={handleTransactionSubmit} />
      <div>
        {[...Array(additionalFormCount)].map((_, index) => (
          <div key={index}>
            <RestockProductForm
              onSubmit={handleProductSubmit}
              onDelete={() => handleDeleteFormClick(index)}
            />
          </div>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
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
          onClick={handleAddFormClick}
        >
          <u>+ Add Another Product</u>
        </button>
        <br />
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
          onClick={handleFormSubmit}
        >
          Submit
        </button>
      </div>
    </div>
  );
}
*/

/* PREVIOUS CODE
  const [form1Data, setForm1Data] = useState({});
  const [form2Data, setForm2Data] = useState({});
  const [additionalFormCount, setAdditionalFormCount] = useState(1);

  const handleForm1Submit = (data) => {
    setForm1Data(data);
  };

  const handleForm2Submit = (data) => {
    setForm2Data(data);
  };

  const handleOverallSubmit = () => {
    console.log("Form 1 Data:", form1Data);
    console.log("Form 2 Data:", form2Data);
  };

  const handleAddFormClick = () => {
    setAdditionalFormCount((prevCount) => prevCount + 1);
  };

  const handleDeleteFormClick = (index) => {
    setAdditionalFormCount((prevCount) => prevCount - 1);
  };

  return (
    <div>
      <RestockTransactionForm onSubmit={handleForm1Submit} />
      <div>
        {[...Array(additionalFormCount)].map((_, index) => (
          <div key={index}>
            <RestockProductForm
              onSubmit={handleForm2Submit}
              onDelete={() => handleDeleteFormClick(index)}
            />
          </div>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
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
          onClick={handleAddFormClick}
        >
          <u>+ Add Another Product</u>
        </button>
        <br />
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
          onClick={handleOverallSubmit}
        >
          Submit
        </button>
      </div>
    </div>
  );
  */
