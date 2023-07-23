import { useState, useEffect } from "react";
import { projectFirestore } from "../../firebase/config";
import { useAuthContext } from "../../hooks/useAuthContext";
import { isAfter } from "date-fns";

// Styles
import { FaTimes } from "react-icons/fa";

export default function SalesForm() {
  const { user } = useAuthContext();
  const [transactionForms, setTransactionForms] = useState({
    date: "",
    time: "",
    transactionID: "",
    transactionAmount: 0,
  });
  const [productForms, setProductForms] = useState([
    {
      productId: "",
      productName: "",
      sellingPrice: "",
      quantity: "",
    },
  ]);
  const [productIds, setProductIds] = useState([]);
  const [formErrors, setFormErrors] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProductIds = async () => {
      const snapshot = await projectFirestore
        .collection(`users/${user.uid}/products`)
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

  const handleTransactionChange = (field, value) => {
    setTransactionForms((prevTransactionForms) => ({
      ...prevTransactionForms,
      [field]: value,
    }));
  };

  const handleProductChange = async (index, field, value) => {
    const updatedForms = [...productForms];
    updatedForms[index] = {
      ...updatedForms[index],
      [field]: value,
    };

    if (field === "productId") {
      const productId = value;

      // Fetch the product details from the products collection
      const productSnapshot = await projectFirestore
        .collection(`users/${user.uid}/products`)
        .where("productId", "==", productId)
        .limit(1)
        .get();

      if (!productSnapshot.empty) {
        const productData = productSnapshot.docs[0].data();
        const productName = productData.productName || "";
        updatedForms[index].productName = productName;
      }

      // Fetch the selling price and transaction ID from salesitems collection
      updatedForms[index].sellingPrice = "";
      const salesItemsSnapshot = await projectFirestore
        .collection(`users/${user.uid}/salesitems`)
        .where("productId", "==", productId)
        .orderBy("transactionID", "desc")
        .limit(1)
        .get();

      if (!salesItemsSnapshot.empty) {
        const salesItemData = salesItemsSnapshot.docs[0].data();
        const sellingPrice = salesItemData?.sellingPrice || "";
        const productName = salesItemData?.productName || "";

        const transactionID = salesItemData.transactionID;
        const salesSnapshot = await projectFirestore
          .collection(`users/${user.uid}/sales`)
          .where("transactionID", "==", transactionID)
          .limit(1)
          .get();

        if (!salesSnapshot.empty) {
          const salesData = salesSnapshot.docs[0].data();
          const latestTransactionID = salesData.transactionID;

          const latestSalesItemsSnapshot = await projectFirestore
            .collection(`users/${user.uid}/salesitems`)
            .where("transactionID", "==", latestTransactionID)
            .where("productId", "==", productId)
            .limit(1)
            .get();

          if (!latestSalesItemsSnapshot.empty) {
            const latestSalesItemData = latestSalesItemsSnapshot.docs[0].data();
            const latestSellingPrice = latestSalesItemData.sellingPrice || "";
            updatedForms[index].sellingPrice = latestSellingPrice;
          }
        }

        updatedForms[index].sellingPrice = sellingPrice;
        updatedForms[index].productName = productName;
      }
    }

    setProductForms(updatedForms);
  };

  const addProductForm = () => {
    setProductForms([
      ...productForms,
      {
        productId: "",
        productName: "",
        sellingPrice: "",
        quantity: "",
      },
    ]);
  };

  const removeProductForm = (index) => {
    const updatedForms = [...productForms];
    updatedForms.splice(index, 1);
    setProductForms(updatedForms);
  };

  useEffect(() => {
    const calculateTransactionAmount = () => {
      let totalAmount = 0;
      productForms.forEach((form) => {
        const quantity = parseFloat(form.quantity);
        const sellingPrice = parseFloat(form.sellingPrice);
        if (!isNaN(quantity) && !isNaN(sellingPrice)) {
          totalAmount += quantity * sellingPrice;
        }
      });
      setTransactionForms((prevTransactionForms) => ({
        ...prevTransactionForms,
        transactionAmount: totalAmount.toFixed(2),
      }));
    };

    calculateTransactionAmount();

    // Calculate and update the transaction amount when product forms change
    let totalAmount = 0;
    productForms.forEach((form) => {
      const quantity = parseFloat(form.quantity);
      const sellingPrice = parseFloat(form.sellingPrice);
      if (!isNaN(quantity) && !isNaN(sellingPrice)) {
        totalAmount += quantity * sellingPrice;
      }
    });
    setTransactionForms((prevTransactionForms) => ({
      ...prevTransactionForms,
      transactionAmount: parseFloat(totalAmount).toFixed(2),
    }));
  }, [productForms]);

  const validateForm = async () => {
    try {
      console.log("Validating Form");
      const errors = [];

      const dateTime = new Date(
        `${transactionForms.date}T${transactionForms.time}`
      );

      // Validate transaction form
      if (transactionForms.date === "") {
        errors.push("Transaction Date field cannot be empty");
      }

      if (transactionForms.time === "") {
        errors.push("Transaction Time field cannot be empty");
      }

      if (isNaN(dateTime)) {
        errors.push("Transaction Date and Time cannot be invalid");
      }

      if (transactionForms.transactionID === "") {
        errors.push("Transaction ID field cannot be empty");
      }

      // Validate product forms
      for (let index = 0; index < productForms.length; index++) {
        const form = productForms[index];

        if (form.productId === "") {
          errors.push(`Product ${index + 1} ID field cannot be empty`);
        }
        if (form.productName === "") {
          errors.push(`Product ${index + 1} Name field cannot be empty`);
        }
        if (
          form.quantity === "" ||
          isNaN(form.quantity) ||
          parseFloat(form.quantity) <= 0
        ) {
          errors.push(`Valid quantity is required for product ${index + 1}`);
        }
        if (
          form.sellingPrice === "" ||
          isNaN(form.sellingPrice) ||
          parseFloat(form.sellingPrice) < 0
        ) {
          errors.push(
            `Valid selling price is required for product ${index + 1}`
          );
        }

        const querySnapshot = await projectFirestore
          .collection(`users/${user.uid}/products`)
          .where("productId", "==", `${form.productId}`)
          .get();

        if (querySnapshot.empty) {
          errors.push(`Product ${index + 1} does not exist`);
        } else {
          console.log("Checking Product Quantity");
          const productData = querySnapshot.docs[0].data();
          const batchDetails = productData.batchDetails || [];
          console.log(batchDetails);
          let totalQuantity = 0;

          for (const batch of batchDetails) {
            const restockDateTime = batch.restockDateTime.toDate();
            if (isAfter(dateTime, restockDateTime)) {
              totalQuantity += batch.quantity;
              console.log(totalQuantity);
            }
          }

          if (parseInt(totalQuantity) < parseInt(form.quantity, 10)) {
            errors.push(
              `Product ${index + 1} does not have sufficient quantity`
            );
          }
        }
      }
      return errors;
    } catch (error) {
      console.error("Error while validating form:", error);
      return [
        "An error occurred while validating the form. Please try again later.",
      ];
    }
  };

  const handleSubmit = async () => {
    try {
      console.log(transactionForms);
      const errors = await validateForm();

      if (errors.length > 0) {
        console.log(errors);
        setFormErrors(errors);
      } else {
        setIsSubmitting(true);

        // Check if transaction ID is unique
        const transactionID = transactionForms.transactionID;
        const salesItemsSnapshot = await projectFirestore
          .collection(`users/${user.uid}/salesitems`)
          .where("transactionID", "==", transactionID)
          .limit(1)
          .get();

        if (!salesItemsSnapshot.empty) {
          setFormErrors(["Sales ID must be unique"]);
          setIsSubmitting(false);
          return;
        }

        console.log("Submitting");
        // Get the transaction ID
        const dateTime = new Date(
          `${transactionForms.date}T${transactionForms.time}`
        );
        const transactionData = {
          ...transactionForms,
          dateTime: dateTime,
          transactionAmount: parseFloat(
            transactionForms.transactionAmount
          ).toFixed(2),
        };
        delete transactionData.date;
        delete transactionData.time;
        await projectFirestore
          .collection(`users/${user.uid}/sales`)
          .doc(transactionID)
          .set(transactionData);
        console.log(transactionData);

        // Update the products collection
        for (const form of productForms) {
          const { productId, quantity } = form;

          const querySnapshot = await projectFirestore
            .collection(`users/${user.uid}/products`)
            .where("productId", "==", `${productId}`)
            .get();

          const productDocRef = querySnapshot.docs[0].ref;
          const productData = querySnapshot.docs[0].data();
          const batchDetails = productData.batchDetails || [];

          // Sort the batchDetails array based on expiryDate in ascending order
          batchDetails.sort(
            (a, b) => new Date(b.expiryDate) - new Date(a.expiryDate)
          );

          let remainingQuantity = quantity;

          for (const batch of batchDetails) {
            console.log(isAfter(dateTime, batch.restockDateTime.toDate()));
            if (remainingQuantity <= 0) {
              break;
            } else if (isAfter(dateTime, batch.restockDateTime.toDate())) {
              if (batch.quantity <= remainingQuantity) {
                remainingQuantity -= batch.quantity;
                batch.quantity = 0;
              } else {
                batch.quantity -= remainingQuantity;
                remainingQuantity = 0;
              }
            }
          }

          // Remove batches with quantity 0
          const updatedBatchDetails = batchDetails.filter(
            (batch) => batch.quantity > 0
          );

          await productDocRef.update({
            batchDetails: updatedBatchDetails,
            totalQuantity: updatedBatchDetails.reduce(
              (sum, batch) => parseInt(sum) + parseInt(batch.quantity),
              0
            ),
          });

          form.transactionID = transactionID;
          form.quantity = parseInt(form.quantity, 10);
          form.sellingPrice = parseFloat(form.sellingPrice).toFixed(2);
          await projectFirestore
            .collection(`users/${user.uid}/salesitems`)
            .doc(`${transactionID} -- ${form.productId}`)
            .set(form);
        }
        console.log("done");

        setFormErrors(null);

        // Reset forms after submission
        setTransactionForms({
          date: "",
          time: "",
          transactionID: "",
          transactionAmount: 0,
        });
        setProductForms([
          {
            productId: "",
            productName: "",
            sellingPrice: "",
            quantity: "",
          },
        ]);

        // Display success message
        const totalAmount = parseFloat(transactionForms.transactionAmount);
        if (!isNaN(totalAmount)) {
          alert(
            `Successfully recorded!\nSales Transaction ID: ${transactionID}\nTotal Amount: ${totalAmount}`
          );
        }
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Error while handling form submission:", error);
      setFormErrors([
        "An error occurred while submitting the form. Please try again later.",
      ]);
      setIsSubmitting(false);
    }
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
      <br></br>
      {/* Transaction Form */}
      <h3 style={{ display: "flex", alignItems: "center" }}>
        Sales Transaction Details
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
                value={transactionForms.date}
                onChange={(e) =>
                  handleTransactionChange("date", e.target.value)
                }
              />
            </div>
            <div style={{ width: "45%" }}>
              <label htmlFor="time">Time:</label>
              <input
                type="time"
                id="time"
                value={transactionForms.time}
                onChange={(e) =>
                  handleTransactionChange("time", e.target.value)
                }
              />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ width: "45%" }}>
              <label htmlFor="transactionId">Transaction ID:</label>
              <input
                type="text"
                id="transactionId"
                value={transactionForms.transactionID}
                onChange={(e) =>
                  handleTransactionChange("transactionID", e.target.value)
                }
              />
            </div>
            {/* Transaction Amount */}
            <div style={{ width: "45%" }}>
              <label htmlFor="transactionAmount">
                Total Transaction Amount: ${transactionForms.transactionAmount}
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
            Sales Product {index + 1} Details
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
                    <option value="">Select Product ID</option>
                    {productIds.map((id) => (
                      <option key={id} value={id}>
                        {id}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ width: "45%" }}>
                  <label htmlFor={`productName${index}`}>
                    Product Name: {form.productName}
                  </label>
                  {/*
                  <label htmlFor={`productName${index}`}>Product Name:</label>
                  <input
                    type="text"
                    id={`productName${index}`}
                    value={form.productName}
                    onChange={(e) =>
                      handleProductChange(index, "productName", e.target.value)
                    }
                  />
                  */}
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ width: "45%" }}>
                  <label htmlFor={`sellingPrice${index}`}>Selling Price:</label>
                  <input
                    type="number"
                    id={`sellingPrice${index}`}
                    value={form.sellingPrice}
                    onChange={(e) =>
                      handleProductChange(index, "sellingPrice", e.target.value)
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
