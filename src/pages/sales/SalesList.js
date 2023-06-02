import { useFirestore } from "../../hooks/useFirestore";

// styles
import styles from "./Sales.module.css";

export default function SalesList({ sales }) {
  const { deleteDocument } = useFirestore("sales");

  return (
    <ul className={styles.sales}>
      {sales.map(
        (
          sale // Fixed variable name to avoid conflict
        ) => (
          <li key={sale.id}>
            <p className={styles.productID}>{sale.productID}</p>
            <p className={styles.batchID}>{sale.batchID}</p>{" "}
            <p className={styles.quantity}>{sale.quantity}</p>{" "}
            <button onClick={() => deleteDocument(sale.id)}>x</button>{" "}
          </li>
        )
      )}
    </ul>
  );
}
