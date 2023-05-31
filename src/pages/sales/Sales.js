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
    ["createdAt", "desc"]
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
