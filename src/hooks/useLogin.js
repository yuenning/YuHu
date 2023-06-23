import { useState, useContext } from "react";
import { projectAuth } from "../firebase/config";
import { AuthContext } from "../context/AuthContext";

export const useLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState("");
  const { dispatch } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFormError(null);

    // Validate email and password
    if (email.trim() === "" || password.trim() === "") {
      setFormError("Please enter both email and password.");
      return;
    }

    // Proceed with login
    try {
      await projectAuth.signInWithEmailAndPassword(email, password);
      // Login successful
      const user = projectAuth.currentUser;
      dispatch({ type: "LOGIN", payload: user });
      console.log("Logged in successfully!");
    } catch (error) {
      setError(error.message);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    formError,
    handleSubmit,
  };
};

/* PREVIOUS CODE
import { useState, useEffect } from "react";
import { projectAuth } from "../firebase/config";
import { useAuthContext } from "./useAuthContext";


export const useLogin = () => {
  const [isCancelled, setIsCancelled] = useState(false);
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const { dispatch } = useAuthContext();

  const login = async (email, password) => {
    setError(null);
    setIsPending(true);

    try {
      const res = await projectAuth.signInWithEmailAndPassword(email, password);
      dispatch({ type: "LOGIN", payload: res.user });

      if (!isCancelled) {
        setIsPending(false);
        setError(null);
      }
    } catch (err) {
      if (!isCancelled) {
        setError(err.message);
        setIsPending(false);
      }
    }
  };

  useEffect(() => {
    return () => {
      setIsCancelled(true);
    };
  }, []);

  return { login, isPending, error };
};
*/
