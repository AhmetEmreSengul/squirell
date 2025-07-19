import { GiAcorn } from "react-icons/gi";
import { Link, useNavigate } from "react-router-dom";
import { FaGoogle } from "react-icons/fa";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { IoFishOutline } from "react-icons/io5";
import { API_BASE_URL } from "../../config";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    window.location.href = `${API_BASE_URL}/api/auth/google`;
  };

  return (
    <div className="flex h-screen w-[80%] mt-20 flex-col text-[#adadad]">
      <div className="p-2 text-4xl flex  text-green-300 ">
        <Link to={"/"}>Squirell</Link> <GiAcorn />
      </div>
      <div className="flex items-center justify-center flex-col mt-20">
        <h1 className="text-4xl">Welcome Back</h1>
        <form className="flex flex-col items-center" onSubmit={handleLogin}>
          <input
            className="p-3 mt-5 rounded-lg text-black bg-[#c4c0c0] w-[350px] h-[58px] outline-0 text-lg"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="p-3 mt-5 rounded-lg text-black bg-[#c4c0c0] w-[350px] h-[58px] outline-0 text-lg"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Link
            to="/forgot-password"
            className="text-lg w-full flex justify-center mt-3 cursor-pointer hover:text-green-800 transition items-center gap-2"
          >
            Forgot My Password <IoFishOutline size={32} />
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="p-2 bg-green-600 rounded-lg mt-5 w-30 font-semibold hover:bg-green-500 transition cursor-pointer disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
          {error && <div className="text-red-600 mt-2">{error}</div>}
        </form>
        <p className="m-5">
          Don't have an account?
          <strong className="hover:text-green-800 transition">
            <Link to={"/register"}> Sign Up </Link>
          </strong>{" "}
        </p>

        <button
          onClick={handleGoogle}
          className="flex p-5 text-black cursor-pointer bg-[#c4c0c0] rounded-lg mt-5 w-[350px] h-[58px] items-center gap-5 hover:bg-green-700 hover:text-white transition"
        >
          <FaGoogle size={"24px"} /> Continue With Google
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
