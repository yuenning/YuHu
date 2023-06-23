import { useState } from "react";
import { projectAuth, projectFirestore } from "../firebase/config";
import { useAuthContext } from "./useAuthContext";

export const useSignup = () => {
  // const [isCancelled, setIsCancelled] = useState(false);
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const { dispatch } = useAuthContext();

  const createUserDocument = async (user) => {
    try {
      // Create user document
      await projectFirestore.collection("users").doc(user.uid).set({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      });

      // Create 'products' subcollection for user
      await projectFirestore
        .collection("users")
        .doc(user.uid)
        .collection("products")
        .doc("product");

      // Create 'sales' subcollection for user
      await projectFirestore
        .collection("users")
        .doc(user.uid)
        .collection("sales")
        .doc("sale");

      // Create 'saleItems' subcollection for user
      await projectFirestore
        .collection("users")
        .doc(user.uid)
        .collection("sales")
        .doc("sale")
        .collection("saleItems")
        .doc("saleItem");

      // Create 'restocks' subcollection for user
      await projectFirestore
        .collection("users")
        .doc(user.uid)
        .collection("restocks")
        .doc("restock");

      // Create 'restockItems' subcollection for user
      await projectFirestore
        .collection("users")
        .doc(user.uid)
        .collection("restocks")
        .doc("restock")
        .collection("restockItems")
        .doc("restockItem");
    } catch (err) {
      console.error("Error creating user document: ", err);
    }
  };

  const signup = async (email, password, displayName) => {
    setError(null);
    setIsPending(true);

    try {
      // signup
      const res = await projectAuth.createUserWithEmailAndPassword(
        email,
        password
      );

      if (!res) {
        throw new Error("Could not complete signup");
      }

      // add display name to user
      await res.user.updateProfile({ displayName });

      // create user document in Firestore
      await createUserDocument(res.user);

      // dispatch login action
      dispatch({ type: "LOGIN", payload: res.user });

      setIsPending(false);
      setError(null);
    } catch (err) {
      setError(err.message);
      setIsPending(false);
    }
  };

  return { signup, error, isPending };
};
