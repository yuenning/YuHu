import { useState, useEffect } from "react";
import { useFirestore } from "../../hooks/useFirestore";
import { useAuthContext } from "../../hooks/useAuthContext";

export default function SalesTransactionForm({ uid }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [transactionID, setTransactionID] = useState("");
  const [transactionamount, setTransactionAmount] = useState("");

  // to add the input into user-segregated firestore
  const { user } = useAuthContext();
  const { addDocument, response } = useFirestore(`users/${user.uid}/sales`);

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
              name="date"
              type="date"
              required
              onChange={(e) => setDate(e.target.value)}
              value={date}
            />
          </label>
          <label>
            <span>Time:</span>
            <input
              name="time"
              type="time"
              required
              onChange={(e) => setTime(e.target.value)}
              value={time}
            />
          </label>
          <label>
            <span>Transaction/Invoice ID:</span>
            <input
              name="transactionID"
              type="text"
              required
              onChange={(e) => setTransactionID(e.target.value)}
              value={transactionID}
            />
          </label>
          <label>
            <span>Total Transaction Amount:</span>
            <input
              name="transactionAmount"
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
