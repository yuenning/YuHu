import { useState, useEffect } from "react";
import { projectFirestore, timestamp } from "../../firebase/config";
import { useAuthContext } from "../../hooks/useAuthContext";
import { isAfter, parseISO } from "date-fns";

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
  const [productIds, setProductIds] = useState([]);
  const [formErrors, setFormErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProductIds = async () => {
      const snapshot = await projectFirestore
        .collection(`users/${user.uid}/restockitems`)
        .orderBy("productId")
        .get();

      const ids = snapshot.docs.reduce((uniqueIds, doc) => {
        const productId = doc.data().productId;
        if (!uniqueIds.includes(productId)) {
          uniqueIds.push(productId);
        }
        return uniqueIds;
      }, []);

      setProductIds(ids);
    };

    fetchProductIds();
  }, [user.uid]);
  const handleRestockChange = (field, value) => {
    setRestockForms({ ...restockForms, [field]: value });
  };

  const handleProductChange = async (index, field, value) => {
    const updatedForms = [...productForms];
    updatedForms[index] = {
      ...updatedForms[index],
      [field]: value,
    };

    if (field === "productId") {
      if (value === "__new__") {
        // User selected the "Enter a New Product ID" option
        const newProductId = prompt("Enter the new Product ID:");

        if (newProductId) {
          updatedForms[index].productId = newProductId;
          updatedForms[index].productName = ""; // Clear the product name for the new entry
          setProductIds((prevIds) => [...prevIds, newProductId]);
        } else {
          // If the user cancels or does not enter a new Product ID, reset the form
          updatedForms[index] = {
            productId: "",
            productName: "",
          };
        }
      }
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
        const { costPrice, productName, transactionID } = restockItemData;

        const restocksSnapshot = await projectFirestore
          .collection(`users/${user.uid}/restocks`)
          .where("transactionID", "==", transactionID)
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

        updatedForms[index].costPrice = costPrice || "";
        updatedForms[index].productName = productName || "";
      }
    } /* else if (field === "batchId") {
      const batchIdSnapshot = await projectFirestore
        .collection(`users/${user.uid}/restockitems`)
        .where("productId", "==", updatedForms[index].productId)
        .where("batchId", "==", updatedForms[index].batchId)
        .limit(1)
        .get();

      if (!batchIdSnapshot.empty) {
        setFormErrors([`Product ${index + 1}'s Batch ID must be unique`]);
      } else {
        setFormErrors([]);
      }
    } */
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
    // Calculate and update the total transaction amount
    const totalAmount = productForms.reduce(
      (total, form) => total + form.quantity * form.costPrice,
      0
    );
    setRestockForms((prevForms) => ({
      ...prevForms,
      transactionAmount: totalAmount,
    }));
  }, [productForms]);

  const isDateValid = (dateString) => {
    const dateTime = new Date(`${restockForms.date}T${restockForms.time}`);
    const date = parseISO(dateString);
    return (
      date &&
      ((date.getFullYear() === dateTime.getFullYear() &&
        date.getMonth() === dateTime.getMonth() &&
        date.getDate() === dateTime.getDate()) ||
        isAfter(date, dateTime))
    );
  };

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
    if (!productForms || productForms.length === 0) {
      return errors; // Return early if productForms is empty or null
    }
    productForms.forEach((form, index) => {
      if (form.productId === "") {
        errors.push(`Product ${index + 1}'s Product ID field cannot be empty`);
      }
      if (form.productName === "") {
        errors.push(
          `Product ${index + 1}'s Product Name field cannot be empty`
        );
      }
      if (form.quantity === "" || isNaN(form.quantity) || form.quantity <= 0) {
        errors.push(`Valid quantity is required for product ${index + 1}`);
      }
      if (form.batchId === "") {
        errors.push(`Product ${index + 1}'s Batch ID field cannot be empty`);
      }
      if (
        form.costPrice === "" ||
        isNaN(form.costPrice) ||
        form.costPrice <= 0
      ) {
        errors.push(`Valid cost price is required for product ${index + 1}`);
      }
      if (form.expiryDate === "" || isNaN(parseISO(form.expiryDate))) {
        errors.push(`Product ${index + 1}'s Expiry Date field is invalid`);
      }
      if (!isDateValid(form.expiryDate)) {
        errors.push(
          `Product ${index + 1}'s Expiry Date must be after transaction date`
        );
      }
    });

    return errors;
  };

  const handleSubmit = async () => {
    setFormErrors([]);
    const errors = validateForm();

    if (errors && errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);

    // Check if transaction ID is unique
    const transactionID = restockForms.transactionID;
    const restockItemsSnapshot = await projectFirestore
      .collection(`users/${user.uid}/restockitems`)
      .where("transactionID", "==", transactionID)
      .limit(1)
      .get();

    if (!restockItemsSnapshot.empty) {
      setFormErrors(["Restock ID must be unique"]);
      setIsSubmitting(false);
      return;
    }

    // Check if Batch IDs are unique
    const batchIds = new Set();
    for (const form of productForms) {
      const { productId, batchId } = form;
      if (batchIds.has(`${productId}-${batchId}`)) {
        setFormErrors([`Batch ID must be unique for ${productId}`]);
        setIsSubmitting(false);
        return;
      }
      batchIds.add(`${productId}-${batchId}`);
    }

    // Combine the transaction date and time into a single DateTime value
    const dateTime = new Date(`${restockForms.date}T${restockForms.time}`);

    // Save transaction form to Firebase
    const transactionData = {
      ...restockForms,
      dateTime: timestamp.fromDate(dateTime),
      transactionAmount: parseFloat(restockForms.transactionAmount).toFixed(2),
    };
    delete transactionData.date;
    delete transactionData.time;

    await projectFirestore
      .collection(`users/${user.uid}/restocks`)
      .doc(transactionID)
      .set(transactionData);

    console.log(restockForms);

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

        const productData = {
          transactionID,
          productId,
          productName,
          quantity: parseInt(quantity, 10),
          expiryDate: timestamp.fromDate(new Date(expiryDate)),
          costPrice: parseFloat(costPrice).toFixed(2),
          ...(batchId && { batchId }),
        };
        const expiryDateTimestamp = convertToTimestamp(expiryDate);

        if (expiryDateTimestamp) {
          productData.expiryDate = expiryDateTimestamp;
        } else {
          // Handle the case where expiryDate is invalid or empty
          console.error("Invalid expiry date:", expiryDate);
          return;
        }

        // Update the restockitems collection
        await projectFirestore
          .collection(`users/${user.uid}/restockitems`)
          .doc(`${transactionID} -- ${productData.productId}`)
          .set(productData);
        console.log(productData);

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
            costPrice: parseFloat(costPrice).toFixed(2),
            restockDateTime: timestamp.fromDate(dateTime),
            ...(batchId && { batchId }),
          };
          batchDetails.push(currentBatchData);

          await productDocRef.update({
            totalQuantity: parseInt(updatedQuantity, 10),
            batchDetails,
          });
        } else {
          // Product does not exist, create a new entry
          await projectFirestore
            .collection(`users/${user.uid}/products`)
            .doc(productId)
            .set({
              productId,
              productName,
              batchDetails: [
                {
                  quantity: parseInt(quantity, 10),
                  expiryDate: timestamp.fromDate(new Date(expiryDate)),
                  costPrice: parseFloat(costPrice),
                  restockDateTime: timestamp.fromDate(dateTime),
                },
              ],
              totalQuantity: parseInt(quantity, 10),
            });
        }
      })
    );

    // Reset forms after submission
    setFormErrors(null);
    setRestockForms({
      date: "",
      time: "",
      transactionID: "",
      transactionAmount: 0.0,
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
      `Successfully recorded!\nRestock Transaction ID: ${transactionID}\nTotal Amount: $${restockForms.transactionAmount}`
    );

    setIsSubmitting(false);
  };

  return (
    <div>
      {formErrors && formErrors.length > 0 && (
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
                Total Transaction Amount: $
                {parseFloat(restockForms.transactionAmount).toFixed(2)}
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
                  <select
                    id={`productId${index}`}
                    value={form.productId}
                    onChange={(e) =>
                      handleProductChange(index, "productId", e.target.value)
                    }
                  >
                    <option value="">Select an existing Product ID</option>
                    {productIds.map((productId) => (
                      <option key={productId} value={productId}>
                        {productId}
                      </option>
                    ))}
                    <option value="__new__">Enter a New Product ID</option>
                  </select>
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
                  <label htmlFor={`batchId${index}`}>Batch ID:</label>
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
