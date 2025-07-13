import CountUp from "./CountUp";

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
  bookmarks?: string[];
}

interface FeaturedCardsPreviewProps {
  product: Product;
}

const FeaturedCardsPreview = ({ product }: FeaturedCardsPreviewProps) => {
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

  return (
    <div className="bg-green-700/60 backdrop-blur-xl h-100 relative rounded-lg shadow-2xl cursor-default">
      <img
        className="w-90 h-60 object-cover rounded-t-lg"
        src={product.images[0]?.url || "https://placehold.co/600x400"}
        alt={product.title}
        onError={(e) => {
          e.currentTarget.src = "https://placehold.co/600x400";
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
          {formatRelativeTime(new Date())}
        </p>
        <div className="absolute top-2 right-2 font-semibold bg-black/15 p-3 backdrop-blur-2xl rounded-full text-center">
          <div className="text-2xl rounded-full">
            <CountUp
              from={0}
              to={product.bookmarks?.length || 0}
              separator=","
              direction="up"
              duration={1}
            />
          </div>
        </div>
      </div>
      {/* Overlay to indicate this is preview mode */}
      <div className="absolute inset-0 bg-black/10 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
        <div className="bg-black/70 text-white px-4 py-2 rounded-lg text-sm">
          Sign in to view details
        </div>
      </div>
    </div>
  );
};

export default FeaturedCardsPreview;
