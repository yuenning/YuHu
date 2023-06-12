import { useAuthContext } from "../../hooks/useAuthContext";
import { useCollection } from "../../hooks/useCollection";

// styles
import styles from "./Sales.module.css";

// components
import SalesForm from "./SalesForm";
import SalesList from "./SalesList";

export default function Sales() {
  const { user } = useAuthContext();
  const { documents, error } = useCollection(
    "sales",
    ["uid", "==", user.uid],
    // (original) ["createdAt", "desc"]
    ["date", "desc"], //not sure how to sort them in descending date and time order
    ["time", "desc"]
  );

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {error && <p>{error}</p>}
        {documents && <SalesList sales={documents} />}
      </div>
      <div className={styles.sidebar}>
        <SalesForm uid={user.uid} />
      </div>
    </div>
  );
}
