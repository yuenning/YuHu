import { useAuthContext } from "../../hooks/useAuthContext";
import { useCollection } from "../../hooks/useCollection";

// styles
import styles from "./Price.module.css";

// components
import PriceForm from "./PriceForm";
import PriceList from "./PriceList";

export default function Price() {
  const { user } = useAuthContext();
  const { documents, error } = useCollection(
    "price",
    ["uid", "==", user.uid],
    // (original) ["createdAt", "desc"]
    ["date", "desc"], //not sure how to sort them in descending date and time order
    ["time", "desc"]
  );

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {error && <p>{error}</p>}
        {documents && <PriceList Price={documents} />}
      </div>
      <div className={styles.sidebar}>
        <PriceForm uid={user.uid} />
      </div>
    </div>
  );
}
