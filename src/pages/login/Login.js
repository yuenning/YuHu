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
        <span>email:</span>
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
