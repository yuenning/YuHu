import { useState } from "react";
import { projectFirestore } from "../../firebase/config";
import { useState, useEffect } from "react";
import { useFirestore } from "../../hooks/useFirestore";
import { useAuthContext } from "../../hooks/useAuthContext";

export default function RestockTransactionForm({ uid, onSubmit }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [transactionID, setTransactionID] = useState("");
  const [transactionAmount, setTransactionAmount] = useState("");

  // to add the input into user-segregated firestore
  const { user } = useAuthContext();
  const { addDocument, response } = useFirestore(`users/${user.uid}/restocks`);
  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Form Data:", {
      date,
      time,
      transactionAmount,
      transactionID,
    });

    const transactionData = {
      date: new Date(date).toISOString(),
      time: time,
      transactionID: transactionID,
      transactionAmount: parseFloat(transactionAmount),
    };

    // Save the transaction data to Firebase
    projectFirestore
      .collection(`users/${user.uid}/restocks`)
      .add(transactionData)
      .then((docRef) => {
        console.log("Transaction saved successfully with ID:", docRef.id);
        onSubmit(transactionData);
        // Reset the form
        setDate("");
        setTime("");
        setTransactionID("");
        setTransactionAmount("");
      })
      .catch((error) => {
        console.error("Error saving transaction: ", error);
      });
  };

  return (
    <>
      <h3>Restock Transaction Details</h3>
      <div style={{ paddingBottom: "20px" }}>
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column" }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ width: "45%" }}>
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
            </div>
            <div style={{ width: "45%" }}>
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
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ width: "45%" }}>
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
            </div>
            <div style={{ width: "45%" }}>
              <label>
                <span>Total Transaction Amount:</span>
                <input
                  name="transactionAmount"
                  type="number"
                  required
                  onChange={(e) => setTransactionAmount(e.target.value)}
                  value={transactionAmount}
                />
              </label>
            </div>
          </div>
          <div style={{ alignSelf: "flex-end", marginTop: "10px" }}>
            <button
              type="submit"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "auto",
                padding: "10px",
                color: "white",
                border: "2px solid white",
                borderRadius: "5px",
                fontSize: "100%",
              }}
            >
              Save Transaction
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

/* PREVIOUS FORM HANDLING
 // to add the input into user-segregated firestore
  const { user } = useAuthContext();
  const { addDocument, response } = useFirestore("restocks");

  const handleSubmit = (e) => {
    e.preventDefault();

    addDocument({
      uid,
      date,
      time,
      transactionID,
      transactionamount,
    });
    console.log(user.uid, date, time);

    onSubmit({
      // Call the onSubmit function with the form data
      date,
      time,
      transactionID,
      transactionamount,
    });

  };

  // Reset the form fields
  useEffect(() => {
    if (response.success) {
      setDate("");
      setTime("");
      setTransactionID("");
      setTransactionAmount("");
    }
  }, [response.success]);

  }, [response]);

  return (
    <>
      <h3>Restock Transaction Details</h3>
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
*/