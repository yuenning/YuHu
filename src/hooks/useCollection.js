import { useEffect, useState, useRef } from "react";
import { projectFirestore } from "../firebase/config";

export const useCollection = (collection, _query, _orderBy) => {
  const [documents, setDocuments] = useState(null);
  const [error, setError] = useState(null);

  const query = useRef(_query);
  const orderBy = useRef(_orderBy);

  useEffect(() => {
    let ref = projectFirestore.collection(collection);

    if (query.current) {
      ref = ref.where(...query.current);
    }
    if (orderBy.current) {
      ref = ref.orderBy(...orderBy.current);
    }

    const unsubscribe = ref.onSnapshot(
      (snapshot) => {
        let results = [];
        snapshot.docs.forEach((doc) => {
          results.push({ ...doc.data(), id: doc.id });
        });

        setDocuments(results);
        setError(null);
      },
      (error) => {
        console.log(error);
        setError("Could not fetch the data");
      }
    );

    return () => unsubscribe();
  }, [collection, query, orderBy]);

  return { documents, error };
};
