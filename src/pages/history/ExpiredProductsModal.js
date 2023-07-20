import React from "react";

export default function ExpiredProductsModal({ showModal, closeModal }) {
  const [expiredTransactions, setExpiredTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const fetchExpiredClearance = async () => {
      try {
        setLoading(true);
        const snapshot = await projectFirestore
          .collection(`users/${user.uid}/expiredclearance`)
          .get();
        const transactions = snapshot.docs.map((doc) => doc.data());
        setExpiredTransactions(transactions);
      } catch (error) {
        console.error("Error fetching expired clearance transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpiredClearance();
  }, []);

  return (
    showModal && (
      <div className={styles.modal}>
        <div className={styles.modalContent}>
          <h2>Expired Products Clearance</h2>
          <table>
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Product Name</th>
                <th>Batch ID</th>
                <th>Expiry Date</th>
                <th>Quantity</th>
                <th>Date Of Deletion</th>,
              </tr>
            </thead>
            <tbody>
              {expiredTransactions.map((transaction) => (
                <tr key={transaction.batchId}>
                  <td>{transaction.productID}</td>
                  <td>{transaction.productName}</td>
                  <td>{transaction.batchId}</td>,
                  <td>{transaction.expiryDate}</td>
                  <td>{transaction.quantity}</td>
                  <td>{transaction.dateOfDeletion}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={closeModal} disabled={loading}>
            Close
          </button>
        </div>
      </div>
    )
  );
}
