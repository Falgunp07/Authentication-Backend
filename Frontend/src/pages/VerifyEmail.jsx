import { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function VerifyEmail() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  
  // 1. Grab the exact email we passed into the URL from the Register page 
  const [searchParams] = useSearchParams();
  const emailToVerify = searchParams.get("email");

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // 2. Send the OTP and Email to the backend (Now using POST instead of GET!)
      const response = await axiosInstance.post("/verify-email", {
        email: emailToVerify,
        otp: otp
      });

      setSuccess("Email verified successfully! Redirecting to login...");
      
      // 3. Wait 2 seconds so the user can read the success message, then bounce them to Login
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
        console.error("Verification failed:", err);
        setError(err.response?.data?.message || "Invalid OTP code. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <form onSubmit={handleVerify} className="w-full max-w-sm rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-2 text-center text-3xl font-bold text-gray-800">Verify Email</h2>
        <p className="mb-6 text-center text-sm text-gray-500">
          We sent a 6-digit code to <span className="font-semibold text-gray-800">{emailToVerify}</span>
        </p>

        {error && <p className="mb-4 text-center text-red-500">{error}</p>}
        {success && <p className="mb-4 rounded bg-green-100 p-2 text-center text-green-700">{success}</p>}

        <div className="mb-6 text-center">
          <label className="block text-left text-sm font-medium text-gray-700 mb-2">Enter OTP Code</label>
          <input 
            type="text" 
            required
            maxLength="6"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="123456"
            className="w-full rounded border px-3 py-3 text-center text-2xl tracking-[0.5em] outline-none focus:border-blue-500 font-mono" 
          />
        </div>

        <button 
          type="submit" 
          disabled={loading || !emailToVerify}
          className="w-full rounded bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? "Verifying..." : "Verify My Account"}
        </button>
      </form>
    </div>
  );
}