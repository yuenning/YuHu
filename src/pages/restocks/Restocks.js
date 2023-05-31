import { useAuthContext } from "../../hooks/useAuthContext";
import { useCollection } from "../../hooks/useCollection";

// styles
import styles from "./Restock.module.css";

// components
import RestockForm from "./RestockForm";
import RestockList from "./RestockList";

export default function Restock() {
  const { user } = useAuthContext();
  const { documents, error } = useCollection(
    "restocks",
    ["uid", "==", user.uid],
    ["createdAt", "desc"]
  );

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {error && <p>{error}</p>}
        {documents && <RestockList restocks={documents} />}
      </div>
      <div className={styles.sidebar}>
        <RestockForm uid={user.uid} />
      </div>
    </div>
  );
}
