import { useState, useEffect } from "react";
import { useFirestore } from "../../hooks/useFirestore";

export default function SalesTransactionForm({ uid }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [transactionID, setTransactionID] = useState("");
  const [transactionamount, setTransactionAmount] = useState("");

  const { addDocument, response } = useFirestore("Sales");

  const handleSubmit = (e) => {
    e.preventDefault();
    addDocument({
      uid,
      date,
      time,
      transactionID,
      transactionamount,
    });
  };

  // Reset the form fields
  useEffect(() => {
    if (response && response.success) {
      setDate("");
      setTime("");
      setTransactionID("");
      setTransactionAmount("");
    }
  }, [response]);

  return (
    <>
      <h3>Sales Transaction Details</h3>
      <div style={{ paddingBottom: "20px" }}>
      <form onSubmit={handleSubmit}>
        <label>
          <span>Date:</span>
          <input
            type="date"
            required
            onChange={(e) => setDate(e.target.value)}
            value={date}
          />
        </label>
        <label>
          <span>Time:</span>
          <input
            type="time"
            required
            onChange={(e) => setTime(e.target.value)}
            value={time}
          />
        </label>
        <label>
          <span>Transaction/Invoice ID:</span>
          <input
            type="text"
            required
            onChange={(e) => setTransactionID(e.target.value)}
            value={transactionID}
          />
        </label>
        <label>
          <span>Total Transaction Amount:</span>
          <input
            type="number"
            required
            onChange={(e) => setTransactionAmount(e.target.value)}
            value={transactionamount}
          />
        </label>
      </form>
      </div>
    </>
  );
}
