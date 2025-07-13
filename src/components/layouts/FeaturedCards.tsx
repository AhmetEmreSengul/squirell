import { useState } from "react";
import { Link } from "react-router-dom";
import CountUp from "./CountUp";
import axios from "../../utils/axios";
import { CiBookmark, CiBookmarkCheck } from "react-icons/ci";
import { BACKEND_URL } from "../../config";

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
    firstName: string;
    lastName: string;
  };
  status?: string;
  isLiked?: boolean;
  isBookmarked?: boolean;
  bookmarks?: string[]; // Array of user IDs who bookmarked the product
  createdAt: string; // Added for correct time display
}

interface FeaturedCardsProps {
  product: Product;
  onBookmarkChange?: () => Promise<void> | void;
}

const FeaturedCards = ({ product, onBookmarkChange }: FeaturedCardsProps) => {
  const [loading, setLoading] = useState(false);

  function formatRelativeTime(date: Date) {
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / 1000; // seconds
    if (diff < 60) return `${Math.floor(diff)} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    if (diff < 2592000) return `${Math.floor(diff / 604800)} weeks ago`;
    if (diff < 31536000) return `${Math.floor(diff / 2592000)} months ago`;
    return `${Math.floor(diff / 31536000)} years ago`;
  }

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    setLoading(true);
    try {
      await axios.post(`/products/${product._id}/bookmark`);
      if (onBookmarkChange) {
        await onBookmarkChange(); // Await in case it's async
      }
    } catch (err) {
      // Optionally show error
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (url: string) => {
    if (!url) return "https://placehold.co/600x400";
    if (url.startsWith("/uploads/")) {
      return BACKEND_URL + url;
    }
    return url;
  };

  return (
    <div className="relative">
      <Link to={`/product/${product._id}`}>
        <div className="bg-radial from-[#154403] to-[#000000] h-100 w-80 relative rounded-lg cursor-pointer shadow-lg transition hover:scale-105 hover:shadow-[0_0_20px_8px_rgba(34,197,94,0.7),0_0_40px_16px_rgba(34,197,94,0.3)]">
          <img
            className="w-90 h-60 object-cover rounded-t-lg"
            src={getImageUrl(product.images[0]?.url)}
            alt={product.title}
            onError={(e) => {
              e.currentTarget.src = "./src/img/no-image.jpg";
            }}
          />
          <div>
            <h2 className="text-2xl mt-5 ml-5">{product.title}</h2>
            <p className="ml-5">
              -{product.owner.firstName} {product.owner.lastName}
            </p>
            {product.status === "draft" && (
              <div className="absolute top-2 left-2 bg-yellow-500 text-black px-2 py-1 rounded text-sm font-semibold">
                DRAFT
              </div>
            )}
            <p className="absolute right-3 bottom-2">
              {formatRelativeTime(new Date(product.createdAt))}
            </p>
            <p className="absolute bottom-2 left-4 flex items-center justify-center ">
              <p className="font-bold mr-1">{product.minimumInvestment}$</p>{" "}
              <p>minimum</p>
            </p>
            <div className="absolute top-2 right-2 flex items-center space-x-2">
              <button
                onClick={handleBookmark}
                disabled={loading}
                className="bg-black/80 p-3 backdrop-blur-sm rounded-full"
                title={product.isBookmarked ? "Remove bookmark" : "Bookmark"}
              >
                {product.isBookmarked ? (
                  <div>
                    <CiBookmarkCheck size={30} />
                  </div>
                ) : (
                  <div>
                    <CiBookmark size={30} />
                  </div>
                )}
              </button>
              <span className="text-2xl bg-black/80 backdrop-blur-sm rounded-full py-3 px-5">
                <CountUp
                  from={0}
                  to={product.bookmarks?.length || 0}
                  separator=","
                  direction="up"
                  duration={1}
                />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default FeaturedCards;
