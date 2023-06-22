import { useState, useContext } from "react";
import { projectAuth } from "../../firebase/config";
import { AuthContext } from "../../context/AuthContext";

// styles
import styles from "./Login.module.css";

export default function Login() {
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

  return (
    <form onSubmit={handleSubmit} className={styles["login-form"]}>
      <h2>Welcome back to YuHu!</h2>
      {formError && (
        <div>
          <br></br>
          <p>{formError}</p>
        </div>
      )}
      {error && (
        <div>
          <br></br>
          <p>Invalid email or password. Please try again.</p>
        </div>
      )}
      <label>
        <span>Email:</span>
        <input
          type="email"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
        />
      </label>
      <label>
        <span>Password:</span>
        <input
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
        />
      </label>
      <button className="btn">Login</button>
    </form>
  );
}

/* PREVIOUS CODE WITH HOOK
import { useState } from "react";
import { useLogin } from "../../hooks/useLogin";

// styles
import styles from "./Login.module.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, error, isPending } = useLogin();

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className={styles["login-form"]}>
      <h2>Welcome back to YuHu!</h2>
      <label>
        <span>Email:</span>
        <input
          type="email"
          onChange={(e) => setEmail(e.target.value)} // Update email value as the user types
          value={email} // Set the value of the input field to the current email value
        />
      </label>
      <label>
        <span>Password:</span>
        <input
          type="password"
          onChange={(e) => setPassword(e.target.value)} // Update password value as the user types
          value={password} // Set the value of the input field to the current password value
        />
      </label>
      {!isPending && <button className="btn">Login</button>}

      {isPending && (
        <button className="btn" disabled>
          Loading
        </button>
      )}
      {error && <p>{error}</p>}
    </form>
  );
}
*/
