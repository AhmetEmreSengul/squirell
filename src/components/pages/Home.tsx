import { useEffect, useState } from "react";
import Navbar from "../layouts/Navbar";
import SideBar from "../layouts/SideBar";
import FeaturedCards from "../layouts/FeaturedCards";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Footer from "../layouts/Footer";
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
  isLiked?: boolean;
  isBookmarked?: boolean;
}

const Home = () => {
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [bookmarked, setBookmarked] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch user's products
  const fetchUserProducts = async () => {
    const productsRes = await axios.get("/users/products");
    setMyProducts(productsRes.data.data.products);
  };

  // Fetch user's bookmarks
  const fetchBookmarkedProducts = async () => {
    const bookmarksRes = await axios.get("/users/bookmarks");
    setBookmarked(bookmarksRes.data.data.products);
  };

  // Handler to update bookmark state for a product (refetches from backend)
  const handleBookmarkChange = async () => {
    await fetchUserProducts();
    await fetchBookmarkedProducts();
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        await fetchUserProducts();
        await fetchBookmarkedProducts();
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="w-screen flex flex-col items-center">
        <div className="flex md:hidden z-[50] fixed top-0 left-0 ">
          <SideBar />
        </div>
        <div className="md:flex hidden w-screen left-0 fixed backdrop-blur-sm bg-black/15 z-50">
          <Navbar />
        </div>
        <div className="mt-40 text-center text-white text-xl">
          <div className="text-center text-white text-xl grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-10">
            <SkeletonLayout />
            <SkeletonLayout />
            <SkeletonLayout />
            <SkeletonLayout />
            <SkeletonLayout />
            <SkeletonLayout />
            <SkeletonLayout />
            <SkeletonLayout />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-screen flex flex-col items-center">
        <div className="flex md:hidden z-[100] fixed top-0 left-0 w-full h-full">
          <SideBar />
        </div>
        <div className="md:flex hidden w-screen left-0 fixed backdrop-blur-sm bg-black/15 z-50">
          <Navbar />
        </div>
        <div className="mt-40 text-center text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className=" w-screen flex flex-col items-center">
      <div className="flex md:hidden z-[100] fixed top-0 left-0 ">
        <SideBar />
      </div>
      <div className="md:flex hidden w-screen left-0 fixed backdrop-blur-sm bg-black/15 z-50">
        <Navbar />
      </div>
      <div className="flex flex-col ">
        <div className="flex justify-between items-center mt-40">
          <h1 className=" text-4xl">My Products</h1>
          <button className="bg-green-600 hover:bg-green-700 transition text-white px-4 py-2 rounded-md mt-5">
            <Link to={"/create"}>Create Product</Link>
          </button>
        </div>

        <div className="flex lg:justify-end md:justify-start lg:mt-0 md:mt-5 sm:mt-5"></div>
        {myProducts.length === 0 ? (
          <div className=" text-lg font-light">
            You don't have any products yet. Created products will be visible
            here.
            <p className="text-green-200 underline font-medium cursor-pointer">
              <Link to={"/create"}>Create a Product</Link>
            </p>
          </div>
        ) : (
          <motion.div className="z-0 mr-20 ml-20 grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-20 mt-20 w-fit">
            {myProducts.map((product: Product) => (
              <motion.div
                key={product._id}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.2 }}
                viewport={{ once: true }}
              >
                <FeaturedCards
                  product={{ ...product, createdAt: product.createdAt ?? "" }}
                  onBookmarkChange={handleBookmarkChange}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <div>
        <div className={`text-4xl mt-40`}>Bookmarked Products</div>
        {bookmarked.length === 0 ? (
          <div className="text-lg font-light flex flex-col">
            You dont have any products bookmarked yet, you can bookmark products
            by visiting them.
            <Link
              to={"/listings"}
              className="text-green-200 underline font-semibold"
            >
              Visit Products
            </Link>
          </div>
        ) : (
          <motion.div className="z-0 mr-20 ml-20 grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-20 mt-20 w-fit">
            {bookmarked.map((product: Product) => (
              <motion.div
                key={product._id}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4 }}
                viewport={{ once: true }}
              >
                <FeaturedCards
                  product={product}
                  onBookmarkChange={handleBookmarkChange}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
      <footer className="mt-20 w-full  ">
        <Footer />
      </footer>
    </div>
  );
};

export default Home;
