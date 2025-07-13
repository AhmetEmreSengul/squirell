import { GiAcorn } from "react-icons/gi";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const { forgotPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await forgotPassword(email);
      if (response?.data?.resetUrl) {
        // In development, show the reset URL directly
        setSuccess(
          `Password reset link generated! Click here to reset your password: ${response.data.resetUrl}`
        );
      } else {
        setSuccess("Password reset email sent successfully! Check your inbox.");
      }
      setEmail("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-[80%] mt-20 flex-col text-[#adadad]">
      <div className="p-2 text-4xl flex text-green-300">
        <Link to={"/"}>Squirell</Link> <GiAcorn />
      </div>
      <div className="flex items-center justify-center flex-col mt-20">
        <h1 className="text-4xl mb-8">Forgot Password</h1>
        <p className="text-lg mb-8 text-center max-w-md">
          Enter your email address and we'll send you a link to reset your
          password.
        </p>

        <form className="flex flex-col items-center" onSubmit={handleSubmit}>
          <input
            className="p-3 mt-5 rounded-lg text-black bg-[#c4c0c0] w-[350px] h-[58px] outline-0 text-lg"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="p-2 bg-green-600 rounded-lg mt-5 w-[350px] h-[58px] font-semibold hover:bg-green-500 transition cursor-pointer disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

          {error && (
            <div className="text-red-600 mt-2 text-center">{error}</div>
          )}
          {success && (
            <div className="text-green-600 mt-2 text-center">{success}</div>
          )}
        </form>

        <div className="mt-8 text-center">
          <p className="mb-2">
            Remember your password?{" "}
            <Link
              to="/login"
              className="text-green-400 hover:text-green-300 transition"
            >
              Sign In
            </Link>
          </p>
          <p>
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-green-400 hover:text-green-300 transition"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
