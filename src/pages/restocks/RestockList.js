import { useFirestore } from "../../hooks/useFirestore";

// styles
import styles from "./Restock.module.css";

export default function RestockList({ restocks }) {
  const { deleteDocument } = useFirestore("restocks");

  return (
    <ul className={styles.restocks}>
      {restocks.map((restocks) => (
        <li key={restocks.id}>
          <p className={styles.productName}>{restocks.productName}</p>
          <p className={styles.productID}>${restocks.productID}</p>
          <p className={styles.batchID}>{restocks.batchID}</p>
          <p className={styles.quantity}>${restocks.quantity}</p>
          <p className={styles.expiryDate}>{restocks.expiryDate}</p>
          <p className={styles.sellingPrice}>${restocks.sellingPrice}</p>
          <p className={styles.costPrice}>{restocks.costPrice}</p>

          <button onClick={() => deleteDocument(restocks.id)}>x</button>
        </li>
      ))}
    </ul>
  );
}
