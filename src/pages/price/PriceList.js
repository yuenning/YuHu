import { useFirestore } from "../../hooks/useFirestore";

// styles
import styles from "./Price.module.css";

export default function PriceList({ price }) {
  const { deleteDocument } = useFirestore("price");

  return (
    <ul className={styles.price}>
      {price.map(
        (
          price // Fixed variable name to avoid conflict
        ) => (
          <li key={price.id}>
            <p className={styles.date}>{price.date}</p>
            <p className={styles.time}>{price.time}</p>
            <p className={styles.productName}>{price.productName}</p>
            <p className={styles.productID}>{price.productID}</p>{" "}
            <p className={styles.type}>{price.type}</p>{" "}
            <p className={styles.price}>{price.price}</p>
            <button onClick={() => deleteDocument(price.id)}>x</button>{" "}
          </li>
        )
      )}
    </ul>
  );
}
