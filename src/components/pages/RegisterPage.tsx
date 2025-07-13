import { FaGoogle } from "react-icons/fa";
import { GiAcorn } from "react-icons/gi";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

const RegisterPage = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await register(firstName, lastName, email, password);
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  return (
    <div className="flex h-screen w-[80%] mt-20 flex-col text-[#333]">
      <div className="p-2 text-4xl flex  text-green-300 ">
        <Link to={"/"}>Squirell</Link> <GiAcorn />
      </div>
      <div className="flex items-center justify-center flex-col mt-20">
        <h1 className="text-4xl text-[#adadad]">Welcome</h1>
        <form className="flex flex-col items-center" onSubmit={handleRegister}>
          <input
            className="p-3 mt-5 rounded-lg  bg-[#c4c0c0] w-[350px] h-[58px] outline-0 text-lg"
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <input
            className="p-3 mt-5 rounded-lg  bg-[#c4c0c0] w-[350px] h-[58px] outline-0 text-lg"
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
          <input
            className="p-3 mt-5 rounded-lg  bg-[#c4c0c0] w-[350px] h-[58px] outline-0 text-lg "
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="p-3 mt-5 rounded-lg  bg-[#c4c0c0] w-[350px] h-[58px] outline-0 text-lg"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            className="p-3 mt-5 rounded-lg  bg-[#c4c0c0] w-[350px] h-[58px] outline-0 text-lg"
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="p-2 bg-green-600 rounded-lg mt-5 w-30 font-semibold hover:bg-green-500 transition cursor-pointer disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
          {error && <div className="text-red-600 mt-2">{error}</div>}
        </form>
        <button
          onClick={handleGoogle}
          className="flex p-5 cursor-pointer bg-[#c4c0c0] rounded-lg mt-5 w-[350px] h-[58px] items-center gap-5 hover:bg-green-700 hover:text-white transition"
        >
          <FaGoogle size={"24px"} /> Continue With Google
        </button>
      </div>
    </div>
  );
};

export default RegisterPage;
