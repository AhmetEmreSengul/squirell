import { GiAcorn } from "react-icons/gi";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
  const [tokenValid, setTokenValid] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resetPassword } = useAuth();

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      setTokenValid(true);
    } else {
      setError("Invalid reset link. Please request a new password reset.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await resetPassword(token, password);
      setSuccess("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="flex h-screen w-[80%] mt-20 flex-col text-[#adadad]">
        <div className="p-2 text-4xl flex text-green-300">
          <Link to={"/"}>Squirell</Link> <GiAcorn />
        </div>
        <div className="flex items-center justify-center flex-col mt-20">
          <h1 className="text-4xl mb-8">Invalid Reset Link</h1>
          <p className="text-lg mb-8 text-center max-w-md">
            The password reset link is invalid or has expired. Please request a
            new one.
          </p>
          <Link
            to="/forgot-password"
            className="p-2 bg-green-600 rounded-lg font-semibold hover:bg-green-500 transition cursor-pointer"
          >
            Request New Reset Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-[80%] mt-20 flex-col text-[#adadad]">
      <div className="p-2 text-4xl flex text-green-300">
        <Link to={"/"}>Squirell</Link> <GiAcorn />
      </div>
      <div className="flex items-center justify-center flex-col mt-20">
        <h1 className="text-4xl mb-8">Reset Password</h1>
        <p className="text-lg mb-8 text-center max-w-md">
          Enter your new password below.
        </p>

        <form className="flex flex-col items-center" onSubmit={handleSubmit}>
          <input
            className="p-3 mt-5 rounded-lg text-black bg-[#c4c0c0] w-[350px] h-[58px] outline-0 text-lg"
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            className="p-3 mt-5 rounded-lg text-black bg-[#c4c0c0] w-[350px] h-[58px] outline-0 text-lg"
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="p-2 bg-green-600 rounded-lg mt-5 w-[350px] h-[58px] font-semibold hover:bg-green-500 transition cursor-pointer disabled:opacity-50"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>

          {error && (
            <div className="text-red-600 mt-2 text-center">{error}</div>
          )}
          {success && (
            <div className="text-green-600 mt-2 text-center">{success}</div>
          )}
        </form>

        <div className="mt-8 text-center">
          <p>
            Remember your password?{" "}
            <Link
              to="/login"
              className="text-green-400 hover:text-green-300 transition"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
