import { useState } from "react";
import axiosInstance from "../api/axiosInstance"; 

export default function Login() {
  // 1. useState: This is React's way of remembering things. 
  // We need to remember what the user is currently typing in the email/password boxes.
  // When 'setEmail' is called, React automatically re-draws the screen with the new value.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // We use this state to show error messages (like "Invalid password") to the user.
  const [error, setError] = useState("");

  // 2. The Submit Function: This runs when the user clicks the "Login" button.
  // Notice it has 'async' because reaching out to the backend takes time.
  const handleSubmit = async (e) => {
    // e.preventDefault() stops the browser's default behavior.
    // Normally, clicking submit on a form refreshes the entire webpage. We DON'T want that in React.
    e.preventDefault(); 
    
    // Clear any old error messages every time they try to log in
    setError("");

    try {
      // 3. The API Call: We use our customized axios to send the email and password
      // to http://localhost:3000/api/auth/login.
      const response = await axiosInstance.post("/login", {
        email: email,
        password: password
      });

      // 4. Success! If the backend returns a 200 status, we grab the token it sent us.
      const { token } = response.data;
      
      // For now, we will just save the token in LocalStorage so the browser doesn't forget it
      localStorage.setItem("token", token);
      
      console.log("Logged in perfectly! Token:", token);
    } catch (err) {
      console.error("Login failed:", err);
      
      // err.response?.data?.message looks deep into the object to see if the backend sent a specific string message.
      setError(err.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      {/* The Form container styling */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-6 text-center text-3xl font-bold text-gray-800">Log In</h2>
        
        {/* If 'error' has words in it, render this red text box */}
        {error && <p className="mb-4 text-center text-red-500">{error}</p>}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input 
            type="email" 
            required
            // Connect this input box to the 'email' state memory
            value={email}
            // onChange fires every single time the user presses a key. It updates the memory instantly!
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
          className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}