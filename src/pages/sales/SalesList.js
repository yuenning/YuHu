import { useFirestore } from "../../hooks/useFirestore";

// styles
import styles from "./Sales.module.css";

export default function SalesList({ sales }) {
  const { deleteDocument } = useFirestore("sales");

  return (
    <ul className={styles.sales}>
      {sales.map((sales) => (
        <li key={sales.id}>
          <p className={styles.productID}>{sales.productID}</p>
          <p className={styles.batchID}>${sales.batchID}</p>
          <p className={styles.quantity}>${sales.quantity}</p>
          <button onClick={() => deleteDocument(sales.id)}>x</button>
        </li>
      ))}
    </ul>
  );
}
