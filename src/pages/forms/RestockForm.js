import React, { useState } from "react";

// Form components
import RestockTransactionForm from "./RestockTransactionForm";
import RestockProductForm from "./RestockProductForm";

export default function RestockForms() {
  const [form1Data, setForm1Data] = useState({});
  const [form2Data, setForm2Data] = useState({});

  const handleForm1Submit = (data) => {
    setForm1Data(data);
  };

  const handleForm2Submit = (data) => {
    setForm2Data(data);
  };

  const handleOverallSubmit = () => {
    // Handle the submission of both form data here
    // You can perform any necessary logic or API calls
    console.log("Form 1 Data:", form1Data);
    console.log("Form 2 Data:", form2Data);
  };

  return (
    <div>
      <h1>Form 1</h1>
      <RestockTransactionForm onSubmit={handleForm1Submit} />

      <h1>Form 2</h1>
      <RestockProductForm onSubmit={handleForm2Submit} />
      <br></br>
      <button onClick={handleOverallSubmit}>Submit</button>
    </div>
  );
}
