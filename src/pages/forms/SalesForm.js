import { useState, useEffect } from "react";
import { projectFirestore } from "../../firebase/config";
import { useAuthContext } from "../../hooks/useAuthContext";

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

  useEffect(() => {
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
      transactionAmount: totalAmount,
    }));
  }, [productForms]);

  const handleTransactionChange = (field, value) => {
    setTransactionForms({ ...transactionForms, [field]: value });
  };

  const handleProductChange = (index, field, value) => {
    const updatedForms = [...productForms];
    updatedForms[index][field] = value;
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

  const handleSubmit = async () => {
    // Check if all products exist and have sufficient quantity
    const productsExist = await Promise.all(
      productForms.map(async (form) => {
        const querySnapshot = await projectFirestore
          .collection(`users/${user.uid}/products`)
          .where("productId", "==", form.productId)
          .get();

        if (querySnapshot.empty) {
          console.log(form.productId + " does not exist");
          return false;
        }

        const productData = querySnapshot.docs[0].data();
        const totalQuantity = productData.totalQuantity;

        if (parseInt(totalQuantity) < parseInt(form.quantity)) {
          console.log(form.productId + " does not have sufficient quantity");
          return false;
        }

        return true;
      })
    );

    if (!productsExist.every((exist) => exist)) {
      alert(
        "One or more products do not exist or have insufficient quantity. Submission rejected."
      );
      return;
    }

    // Save transaction forms to Firebase
    await projectFirestore
      .collection(`users/${user.uid}/sales`)
      .add(transactionForms);

    // Get the transaction ID
    const transactionId = transactionForms.transactionId;

    // Update the products collection
    productForms.forEach(async (form) => {
      const { productId, quantity } = form;

      const querySnapshot = await projectFirestore
        .collection(`users/${user.uid}/products`)
        .where("productId", "==", productId)
        .get();

      const productDocRef = querySnapshot.docs[0].ref;

      const productData = querySnapshot.docs[0].data();
      const batchDetails = productData.batchDetails || [];

      // Sort the batchDetails array based on expiryDate in ascending order
      batchDetails.sort(
        (a, b) => new Date(a.expiryDate) - new Date(b.expiryDate)
      );

      let remainingQuantity = quantity;

      for (const batch of batchDetails) {
        if (remainingQuantity <= 0) {
          break;
        }

        if (batch.quantity <= remainingQuantity) {
          remainingQuantity -= batch.quantity;
          batch.quantity = 0;
        } else {
          batch.quantity -= remainingQuantity;
          remainingQuantity = 0;
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

      form.transactionId = transactionId;
      projectFirestore.collection(`users/${user.uid}/salesitems`).add(form);
    });

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
        `Successfully recorded!\nSales Transaction ID: ${transactionId}\nTotal Amount: ${totalAmount}`
      );
    }
  };

  return (
    <div>
      {/* Transaction Form */}
      <h3>Sales Transaction Details</h3>
      <div>
        <label htmlFor="date">Date:</label>
        <input
          type="date"
          id="date"
          value={transactionForms.date}
          onChange={(e) => handleTransactionChange("date", e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="time">Time:</label>
        <input
          type="time"
          id="time"
          value={transactionForms.time}
          onChange={(e) => handleTransactionChange("time", e.target.value)}
        />
      </div>
      <div>
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
      <div>
        <label>Transaction Amount: $</label>
        <span>{transactionForms.transactionAmount}</span>
      </div>

      {/* Product Forms */}
      {productForms.map((form, index) => (
        <div key={index}>
          <br></br>
          <h3>Sales Product {index + 1} Details</h3>
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
          {index > 0 && (
            <button type="button" onClick={() => removeProductForm(index)}>
              Remove Product Form
            </button>
          )}
        </div>
      ))}
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
import SalesTransactionForm from "./SalesTransactionForm";
import SalesProductForm from "./SalesProductForm";

export default function SalesForm() {
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
      .collection(`users/${user.uid}/sales`)
      .doc();
    transactionRef
      .set({ ...transactionData })
      .then(() => {
        // Save the product data to Firestore
        const batch = projectFirestore.batch();
        const productsRef = projectFirestore.collection(
          `users/${user.uid}/salesitems`
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
      <SalesTransactionForm onSubmit={handleTransactionSubmit} />
      <div>
        {[...Array(additionalFormCount)].map((_, index) => (
          <div key={index}>
            <SalesProductForm
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
import React, { useState } from "react";

// Form components
import SalesTransactionForm from "./SalesTransactionForm";
import SalesProductForm from "./SalesProductForm";

export default function RestockForms() {
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
      <SalesTransactionForm onSubmit={handleForm1Submit} />
      <div>
        {[...Array(additionalFormCount)].map((_, index) => (
          <div key={index}>
            <SalesProductForm onSubmit={handleForm2Submit} onDelete={() => handleDeleteFormClick(index)} />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <button 
          style= {{ 
            display: 'block', 
            width: '315px', 
            padding: '10px', 
            color: 'black', 
            border: 'none',
            borderRadius: '5px', 
            fontSize: '100%' 
          }} 
          onClick={handleAddFormClick}>
            <u>+ Add Another Product</u>
        </button>
        <br />
        <button 
          style={{ 
            display: 'block', 
            width: '315px', 
            padding: '10px', 
            backgroundColor: '#000000', 
            color: 'white',
            border: 'none', 
            borderRadius: '5px', 
            fontSize: '100%' 
          }} 
          onClick={handleOverallSubmit}>Submit</button>
      </div>
    </div>
  );
}
*/
