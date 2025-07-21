import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../layouts/Navbar";
import SideBar from "../layouts/SideBar";
import { motion } from "framer-motion";
import { FaShare, FaGlobe, FaEdit, FaTrash } from "react-icons/fa";
import { CiBookmark, CiBookmarkCheck } from "react-icons/ci";
import axios from "../../utils/axios";
import { useAuth } from "../../contexts/AuthContext";
import { API_BASE_URL } from "../../config";

interface Product {
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
    _id: string;
    firstName: string;
    lastName: string;
  };
  status?: string;
  isBookmarked?: boolean;
}

interface Review {
  _id: string;
  title: string;
  content: string;
  rating: number;
  user: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/products/${id}`);
        setProduct(res.data.data.product);
        setIsBookmarked(res.data.data.product.isBookmarked || false);
      } catch (err: any) {
        setError(err.response?.data?.message || "Product not found");
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const res = await axios.get(`/reviews?product=${id}`);
        setReviews(res.data.data.reviews);
      } catch (err: any) {
        console.error("Failed to fetch reviews:", err);
      }
    };

    if (id) {
      fetchProduct();
      fetchReviews();
    }
  }, [id]);

  const handleBookmark = async () => {
    try {
      await axios.post(`/products/${id}/bookmark`);

      // Refetch the product to get the true state from the backend
      const res = await axios.get(`/products/${id}`);
      const newIsBookmarked = res.data.data.product.isBookmarked || false;

      setIsBookmarked(newIsBookmarked);
      setProduct(res.data.data.product);
    } catch (err: any) {
      console.error("Failed to bookmark product:", err);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.title,
        text: product?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const handlePublish = async () => {
    if (!product || !user) return;

    try {
      setPublishing(true);
      await axios.post(`/products/${product._id}/publish`);

      // Update the product status locally
      setProduct((prev) => (prev ? { ...prev, status: "active" } : null));

      alert("Product published successfully!");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to publish product");
    } finally {
      setPublishing(false);
    }
  };

  const handleEdit = () => {
    if (!product) return;
    navigate(`/edit-product/${product._id}`);
  };

  const handleDelete = async () => {
    if (!product || !user) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this product? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      await axios.delete(`/products/${product._id}`);

      alert("Product deleted successfully!");
      navigate("/listings");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete product");
    } finally {
      setDeleting(false);
    }
  };

  // Check if current user is the owner and product is draft
  const isOwner = user && product && user._id === product.owner._id;
  const isDraft = product && product.status === "draft";
  const canPublish = isOwner && isDraft;

  const getImageUrl = (url: string) => {
    if (!url) return "/img/landing.png";
    if (url.startsWith("/uploads/")) {
      return API_BASE_URL + url;
    }
    return url;
  };

  if (loading) {
    return (
      <div className="w-screen flex flex-col items-center pb-40">
        <div className="flex md:hidden z-[100] fixed top-0 left-0 w-full h-full">
          <SideBar />
        </div>
        <div className="md:flex hidden w-screen left-0 fixed backdrop-blur-sm bg-black/15 z-50">
          <Navbar />
        </div>
        <div className="mt-40 text-center text-white text-xl">
          Loading product...
        </div>
      </div>
    );
  }

  if (error || !product) {
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
    <div className="min-h-screen flex flex-col items-center w-full">
      <div className="flex md:hidden z-[100] fixed top-0 left-0 w-full h-full">
        <SideBar />
      </div>
      <div className="md:flex hidden w-screen left-0 fixed backdrop-blur-sm bg-black/15 z-50">
        <Navbar />
      </div>

      <motion.div
        className="mt-40 flex flex-col items-center w-full px-4 md:px-0 md:w-[80%]"
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        viewport={{ once: true }}
      >
        <div className="flex flex-col lg:flex-row w-full gap-8 items-start">
          <div className="w-full lg:w-1/2">
            <img
              className="w-full h-auto max-w-full rounded-lg shadow-2xl"
              src={getImageUrl(product.images[0]?.url)}
              alt={product.title}
              onError={(e) => {
                e.currentTarget.src = "/img/landing.png";
              }}
            />
          </div>

          <div className="w-full lg:w-1/2 flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold break-words">
                {product.title}
              </h1>
              {product.status === "draft" && (
                <span className="bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-semibold w-fit">
                  DRAFT
                </span>
              )}
              {product.status === "active" && (
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold cursor-pointer w-fit">
                  PUBLISHED
                </span>
              )}
            </div>
            <p className="text-lg mb-6">{product.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-[#c4c0c0] p-4 rounded-lg">
                <h3 className="font-semibold text-black">Total Value</h3>
                <p className="text-black">
                  ${product.totalValue.toLocaleString()}
                </p>
              </div>
              <div className="bg-[#c4c0c0] p-4 rounded-lg">
                <h3 className="font-semibold text-black">Share Price</h3>
                <p className="text-black">${product.sharePrice}</p>
              </div>
              <div className="bg-[#c4c0c0] p-4 rounded-lg">
                <h3 className="font-semibold text-black">Available Shares</h3>
                <p className="text-black">{product.availableShares}</p>
              </div>
              <div className="bg-[#c4c0c0] p-4 rounded-lg">
                <h3 className="font-semibold text-black">Min Investment</h3>
                <p className="text-black">${product.minimumInvestment}</p>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <button
                onClick={handleBookmark}
                className={`px-4 py-2 rounded-lg font-semibold transition cursor-pointer ${
                  isBookmarked
                    ? "bg-green-700 text-white hover:bg-green-600"
                    : "bg-[#c4c0c0] text-black hover:bg-green-600 hover:text-white"
                }`}
              >
                {isBookmarked ? (
                  <div className="flex flex-row items-center justify-center gap-2">
                    Bookmarked <CiBookmarkCheck size={24} />
                  </div>
                ) : (
                  <div className="flex flex-row items-center justify-center gap-2">
                    Bookmark <CiBookmark size={24} />
                  </div>
                )}
              </button>
              <button
                onClick={handleShare}
                className="px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors"
              >
                <FaShare className="inline mr-2" /> Share
              </button>
              {canPublish && (
                <button
                  onClick={handlePublish}
                  disabled={publishing}
                  className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
                >
                  {publishing ? (
                    "Publishing..."
                  ) : (
                    <p>
                      Publish <FaGlobe />
                    </p>
                  )}
                </button>
              )}
              {isOwner && (
                <>
                  <button
                    onClick={handleEdit}
                    className="px-4 py-2 rounded-lg bg-yellow-500 text-black font-semibold hover:bg-yellow-600 transition-colors"
                  >
                    <FaEdit className="inline mr-2" /> Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
                  >
                    {deleting ? (
                      "Deleting..."
                    ) : (
                      <>
                        <FaTrash className="inline mr-2" /> Delete
                      </>
                    )}
                  </button>
                </>
              )}
            </div>

            <div className="bg-[#c4c0c0] p-4 rounded-lg mt-5">
              <h3 className="font-semibold text-black mb-2">Owner</h3>
              <p className="text-black">
                {product.owner.firstName} {product.owner.lastName}
              </p>
            </div>
          </div>
        </div>

        <div className="w-full mt-12">
          <h2 className="text-3xl font-bold mb-6">Reviews</h2>
          {reviews.length === 0 ? (
            <p className="text-lg">
              No reviews yet. Be the first to review this product!
            </p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review._id} className="bg-[#c4c0c0] p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-black">{review.title}</h3>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          className={
                            i < review.rating
                              ? "text-yellow-500"
                              : "text-gray-300"
                          }
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-black mb-2">{review.content}</p>
                  <p className="text-sm text-gray-600">
                    By {review.user.firstName} {review.user.lastName} on{" "}
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      <div className="w-full  mt-20">
       {/*  <footer className="w-full items-center">
          <Footer />
        </footer> */}
      </div>
    </div>
  );
};

export default Product;
