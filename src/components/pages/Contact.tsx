import Footer from "../layouts/Footer";
import Navbar from "../layouts/Navbar";
import SideBar from "../layouts/SideBar";
import { motion } from "framer-motion";
import { useState } from "react";
import axios from "../../utils/axios";

const Contact = () => {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!name.trim() || !title.trim() || !content.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await axios.post("/reviews/feedback", {
        name,
        title,
        content,
        rating,
        category: "platform",
      });
      setSuccess(true);
      setName("");
      setTitle("");
      setContent("");
      setRating(5);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send feedback");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex md:hidden z-[50] fixed top-0 left-0  ">
        <SideBar />
      </div>
      <div className="md:flex hidden w-screen left-0 fixed backdrop-blur-sm bg-black/15 z-50">
        <Navbar />
      </div>
      <div className="flex items-center flex-col w-full">
        <motion.div
          className="mt-30 flex flex-col items-center w-full md:w-[70%]"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          viewport={{ once: true }}
        >
          <h1 className="text-5xl mb-20 text-center">What is Squirell</h1>
          <div className="flex flex-col xl:flex-row items-center text-xl w-full">
            <span className="w-full xl:w-auto mb-6 xl:mb-0">
              Project Squirrel is a fintech platform designed to democratize
              investment in high-value assets such as land and art by enabling
              the purchase of fractional shares. This initiative aims to make
              such investments accessible to a broader audience who can invest
              in assets at a fraction of the total cost.
            </span>
            <img
              className="ml-0 xl:ml-5 mt-10 h-[250px] md:h-[350px] xl:h-[450px] rounded-lg shadow-2xl w-full max-w-[450px] object-cover"
              src="/img/partial.png"
              alt=""
            />
          </div>
        </motion.div>

        <motion.div
          className="flex flex-col items-center w-full md:w-[70%]"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-col xl:flex-row items-center xl:items-start w-full mt-20">
            <img
              className="h-[200px] md:h-[250px] xl:h-[300px] rounded-lg mb-6 xl:mb-0 xl:mr-8 shadow-2xl w-full max-w-[300px] object-cover"
              src="/img/painting.png"
              alt=""
            />
            <div className="w-full">
              <h1 className="text-5xl mb-6 mt-5 text-center xl:text-left">
                Fractional Ownership?
              </h1>
              <p className="text-xl flex items-center">
                Fractional ownership is a method that allows multiple
                individuals to own a portion of an asset, making high-value
                investments accessible to a broader audience. A fractional share
                is exactly what its name implies: a portion (or fraction) of a
                company stock that is less than one full share. Unlike
                traditional whole share trading, fractional shares allow people
                to make investments based upon a specific dollar amount, instead
                of an individual stock’s price. For example, through fractional
                share trading, you can invest $50 in a stock whose price per
                share is $100; in turn, you would be granted ownership of half a
                share of stock.
              </p>
            </div>
          </div>
        </motion.div>
        <motion.div
          className="flex flex-col items-center w-full md:w-[70%] mt-10"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="w-full flex flex-col items-center">
            <h1 className="text-5xl text-center">Help Us Improve</h1>
            <div className="flex flex-col items-center w-full">
              <input
                className="p-3 mt-5 rounded-lg bg-[#c4c0c0] w-full max-w-[350px] h-[58px] outline-0 text-lg text-black"
                type="text"
                placeholder="Your Name(Optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                className="p-3 mt-5 rounded-lg bg-[#c4c0c0] w-full max-w-[350px] h-[58px] outline-0 text-lg text-black"
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                className="p-3 mt-5 rounded-lg text-black bg-[#c4c0c0] w-full max-w-[550px] h-[250px] outline-0 text-lg"
                placeholder="Tell us About Your Experience"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <div className="flex items-center gap-4 mt-4">
                <span className="text-white">Rating:</span>
                <select
                  className="p-2 rounded-lg bg-[#c4c0c0] text-black"
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                >
                  <option value={5}>5 Stars</option>
                  <option value={4}>4 Stars</option>
                  <option value={3}>3 Stars</option>
                  <option value={2}>2 Stars</option>
                  <option value={1}>1 Star</option>
                </select>
              </div>
              <button
                onClick={handleSend}
                disabled={loading}
                className="text-black p-2 w-20 text-lg bg-[#c4c0c0] mt-5 rounded-lg cursor-pointer hover:bg-green-700 hover:text-white transition disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send"}
              </button>
              {error && (
                <div className="text-red-500 mt-2 text-center">{error}</div>
              )}
              {success && (
                <div className="text-green-500 mt-2 text-center">
                  Thank you for your feedback!
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
      <footer className="mt-20 w-full h-40 justify-center items-center ">
        <Footer />
      </footer>
    </div>
  );
};

export default Contact;
