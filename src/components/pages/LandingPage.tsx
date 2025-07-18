import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CarouselPlugin } from "../layouts/Carousel";
import FeaturedCards from "../layouts/FeaturedCards";
import Footer from "../layouts/Footer";
import Navbar from "../layouts/Navbar";
import SideBar from "../layouts/SideBar";
import axios from "../../utils/axios";
import SkeletonLayout from "../layouts/SkeletonLayout";

interface Product {
  createdAt: string;
  _id: string;
  title: string;
  description: string;
  assetType: string;
  category: string;
  totalValue: number;
  sharePrice: number;
  totalShares: number;
  availableShares: number;
  minimumInvestment: number;
  images: Array<{ url: string; alt: string }>;
  owner: {
    firstName: string;
    lastName: string;
  };
  status?: string;
  isLiked?: boolean;
  isBookmarked?: boolean;
  bookmarks?: string[];
}

interface Review {
  _id: string;
  title: string;
  content: string;
  rating: number;
  author?: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  authorName?: string;
  createdAt: string;
  category: string;
  isFeatured: boolean;
}

const LandingPage = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [featuredReviews, setFeaturedReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  console.log("Featured Reviews:", featuredReviews);
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      setIsAuthenticated(!!token);
    };

    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/products/featured", {
          params: {
            limit: 6,
          },
        });
        setFeaturedProducts(res.data.data.products);
      } catch (err: any) {
        console.error("Failed to fetch featured products:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchFeaturedReviews = async () => {
      try {
        setReviewsLoading(true);
        const res = await axios.get("/reviews/featured", {
          params: {
            limit: 6,
          },
        });
        setFeaturedReviews(res.data.data.reviews);
      } catch (err: any) {
        console.error("Failed to fetch featured reviews:", err);
      } finally {
        setReviewsLoading(false);
      }
    };

    checkAuth();
    fetchFeaturedProducts();
    fetchFeaturedReviews();
  }, []);

  return (
    <div className="overflow-hidden">
      <div className="flex md:hidden z-[50] fixed top-0 left-0  ">
        <SideBar />
      </div>
      <div className="md:flex hidden w-screen left-0 fixed backdrop-blur-sm bg-black/15 z-50">
        <Navbar />
      </div>
      <div className="mt-45 flex flex-col items-center  w-screen">
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col items-center"
          >
            <h1 className="text-3xl w-[80%] md:text-7xl md:w-full   mb-5">
              Start Earning The Easiest Way With Squirell!
            </h1>
            <p className="text-xl w-[80%] md:w-full mt-5 text-center">
              Get familiar with fractional shares, invest in land, art, images,
              paintings, and much more...
            </p>
          </motion.div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="mockup-phone h-[800px] mt-10 bg-white flex flex-col items-center">
              <div className="mockup-phone-camera"></div>
              <div className="mockup-phone-display flex ">
                <img
                  className="w-full h-full object-contain mx-auto"
                  src="/img/landing.png"
                  alt="wallpaper"
                />
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="mt-20 flex flex-col justify-center items-center "
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <h2 className="text-4xl mt-5">Featured Products</h2>
          <p className="text-lg mt-5 font-light">
            Discover What Users Are Selling Right Now
          </p>
          <motion.div
            className={`${
              loading
                ? ""
                : "z-0 grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-20"
            }`}
          >
            {loading ? (
              <div className="flex flex-row gap-10 items-center justify-center">
                <SkeletonLayout />
                <SkeletonLayout />
                <SkeletonLayout />
                <SkeletonLayout />
              </div>
            ) : featuredProducts.length === 0 ? (
              <div className="text-center text-white text-xl">
                No products available yet
              </div>
            ) : (
              featuredProducts.map((product, idx) => (
                <motion.div
                  key={product._id}
                  initial={{ y: 30, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{
                    duration: 0.2,
                    delay: 0.35 * idx,
                  }}
                  viewport={{ once: true }}
                >
                  <FeaturedCards
                    product={{ ...product, createdAt: product.createdAt ?? "" }}
                  />
                </motion.div>
              ))
            )}
          </motion.div>

          {!isAuthenticated && featuredProducts.length > 0 && (
            <motion.div
              className="mt-10 text-center"
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <p className="text-lg mb-4 text-gray-300">
                Sign in to view product details and interact with listings
              </p>
              <Link
                to="/login"
                className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                Sign In to Continue
              </Link>
            </motion.div>
          )}
          <div className="mt-20 xl:w-250 lg:w-200 md:w-150 sm:w-100 flex flex-col items-center gap-3">
            <h1 className="text-4xl mb-10">Frequently Asked Questions</h1>
            <div className="collapse bg-[#333] border border-base-300">
              <input type="radio" name="my-accordion-1" defaultChecked />
              <div className="collapse-title font-semibold text-2xl transition accordion-title-custom">
                How do I create an account?
              </div>
              <div className="collapse-content text-md">
                Click the "Sign Up" button in the top right corner and follow
                the registration process. Sign up process is completely free.
              </div>
            </div>
            <div className="collapse bg-[#333] border border-base-300">
              <input type="radio" name="my-accordion-1" />
              <div className="collapse-title font-semibold text-2xl accordion-title-custom transition">
                What is Fractional Ownership?
              </div>
              <div className="collapse-content text-md">
                A portion (or fraction) of a company stock that is less than one
                full share. Unlike traditional whole share trading, fractional
                shares allow people to make investments based upon a specific
                dollar amount, instead of an individual stock's price.asdasd
              </div>
            </div>
            <div className="collapse bg-[#333] border border-base-300">
              <input type="radio" name="my-accordion-1" />
              <div className="collapse-title font-semibold text-2xl accordion-title-custom transition">
                What can I invest in?
              </div>
              <div className="collapse-content text-md">
                You can invest in land, art, images, paintings, and more you can
                check the current listings{" "}
                <Link className="underline font-bold" to={"/listings"}>
                  here,
                </Link>{" "}
                or you can create your own listing and sell it to other users{" "}
                <Link className="font-bold underline" to={"/create"}>
                  here.
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
        <p className="text-4xl mt-20">Recent Reviews</p>

        <motion.div
          className=" shadow-2xl  mt-10"
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {reviewsLoading ? (
            <div className="text-center text-white text-xl py-10">
              Loading customer reviews...
            </div>
          ) : (
            <CarouselPlugin reviews={featuredReviews} />
          )}
        </motion.div>
        <footer className="mt-20 w-full  justify-center items-center border-t-1 ">
          <Footer />
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
