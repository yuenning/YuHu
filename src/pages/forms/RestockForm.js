import React, { useState } from "react";
import RestockTransactionForm from "./RestockTransactionForm";
import RestockProductForm from "./RestockProductForm";

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
      <RestockTransactionForm onSubmit={handleForm1Submit} />
      <div>
        {[...Array(additionalFormCount)].map((_, index) => (
          <div key={index}>
            <RestockProductForm onSubmit={handleForm2Submit} onDelete={() => handleDeleteFormClick(index)} />
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
