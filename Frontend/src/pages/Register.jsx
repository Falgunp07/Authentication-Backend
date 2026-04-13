import { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  // 1. Memory for our form inputs
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  // 2. Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true); // Disable the button while waiting

    try {
      // 3. Send the new user data to the backend
      const response = await axiosInstance.post("/register", {
        username: username,
        email: email,
        password: password
      });

      console.log("Registration successful!", response.data);
      
      // 4. Send them to the login page so they can sign in with their new account
      navigate("/login");
    } catch (err) {
      console.error("Registration failed:", err);
      // Grab the exact error message your backend sends
      setError(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      // Whether it succeeds or fails, turn off the loading state at the very end
      setLoading(false); 
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-6 text-center text-3xl font-bold text-gray-800">Create Account</h2>
        
        {error && <p className="mb-4 text-center text-red-500">{error}</p>}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Username</label>
          <input 
            type="text" 
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2 outline-none focus:border-blue-500" 
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input 
            type="email" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2 outline-none focus:border-blue-500" 
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input 
            type="password" 
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2 outline-none focus:border-blue-500" 
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? "Creating..." : "Sign Up"}
        </button>

        {/* Link back to login if they already have an account */}
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Log in here
          </Link>
        </p>
      </form>
    </div>
  );
}