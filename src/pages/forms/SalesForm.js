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
        {/*<button
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
        </button> */}
      </div>
    </div>
  );
}

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
