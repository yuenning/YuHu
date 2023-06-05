import { useFirestore } from "../../hooks/useFirestore";

// styles
import styles from "./Restock.module.css";

export default function RestockList({ restocks }) {
  const { deleteDocument } = useFirestore("restocks");

  return (
    <ul className={styles.restocks}>
      {restocks.map((restock) => (
        <li key={restock.id}>
          <p className={styles.productName}>{restock.productName}</p>
          <p className={styles.productID}>{restock.productID}</p>{" "}
          <p className={styles.batchID}>{restock.batchID}</p>
          <p className={styles.quantity}>{restock.quantity}</p>{" "}
          <p className={styles.expiryDate}>{restock.expiryDate}</p>
          <p className={styles.sellingPrice}>{restock.sellingPrice}</p>{" "}
          <p className={styles.costPrice}>{restock.costPrice}</p>{" "}
          <button onClick={() => deleteDocument(restock.id)}>x</button>{" "}
        </li>
      ))}
    </ul>
  );
}
