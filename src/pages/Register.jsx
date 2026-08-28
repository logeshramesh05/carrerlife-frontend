import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Spinner } from "../components/Loader";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await register(
        name.trim(),
        email.trim().toLowerCase(),
        password
      );

      if (!data?.accessToken || !data?.refreshToken) {
        throw new Error("Authentication tokens were not returned");
      }

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Create account</h2>
        <p>Start tracking your interviews and resumes</p>
        {error && <p className="error">{error}</p>}
        <div className="field">
          <label>Name</label>
          <input type="text" placeholder="Jane Doe" value={name}
            onChange={(e) => setName(e.target.value)} required autoFocus />
        </div>
        <div className="field">
          <label>Email</label>
          <input type="email" placeholder="you@example.com" value={email}
            onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" placeholder="Enter your password" value={password}
            onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" disabled={loading} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {loading && <Spinner />} {loading ? "Creating" : "Register"}
        </button>
        <p>Already have an account? <Link to="/login">Login</Link></p>
      </form>
    </div>
  );
}
