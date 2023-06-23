import { useState } from "react";
import { useSignup } from "../../hooks/useSignup";

// styles
import styles from "./Signup.module.css";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const { signup, isPending, error } = useSignup();
  const [formError, setFormError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form inputs
    if (
      email.trim() === "" ||
      password.trim() === "" ||
      displayName.trim() === ""
    ) {
      setFormError("Please enter all the required information.");
      return;
    }

    // Proceed with signup
    signup(email, password, displayName);
    if (
      error ===
      "Firebase: The email address is already in use by another account. (auth/email-already-in-use)."
    ) {
      setFormError("The email address is already in use by another account.");
    } else if (error) {
      setFormError(
        "Sign up was not successful. Please verify your details and try again or contact our support staff."
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles["signup-form"]}>
      <h2>Sign Up Now!</h2>
      {formError && (
        <div>
          <br></br>
          <p>{formError}</p>
        </div>
      )}
      <label>
        <span>Company Name:</span>
        <input
          type="text"
          onChange={(e) => setDisplayName(e.target.value)}
          value={displayName}
        />
      </label>
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
      {!isPending && <button className="btn">Sign Up</button>}
      {isPending && (
        <button className="btn" disabled>
          Loading
        </button>
      )}
    </form>
  );
}
