import { useAuthContext } from "../../hooks/useAuthContext";
import { useCollection } from "../../hooks/useCollection";

// styles
import styles from "./History.module.css";

export default function RestockList() {
  // to add the input into user-segregated firestore
  const { user } = useAuthContext();
  const { documents, error } = useCollection(`users/${user.uid}/restocks`);

  // handle errors
  if (!documents || !Array.isArray(documents)) {
    // to verify if documents is either falsy or not an array
    console.log("Error retrieving documents");
    return <p className={styles.transactions}>Please wait!</p>;
  } else if (documents === null) {
    // when there are no transactions
    console.log("There are no transactions");
    return <p className={styles.transactions}>There are no transactions</p>;
  }

  return (
    <ul className={styles.transactions}>
      {error && <p>{error}</p>}
      {documents.map((document) => {
        const date = new Date(document.date);
        const formattedDate = date.toLocaleDateString();

        return (
          <li key={document.id}>
            <p className={styles.name}>{document.transactionID}</p>
            <p className={styles.datetime}>
              {formattedDate} {document.time}
            </p>
            <p className={styles.amount}>${document.transactionAmount}</p>
          </li>
        );
      })}
    </ul>
  );
}
