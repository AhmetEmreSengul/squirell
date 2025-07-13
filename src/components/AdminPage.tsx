import React, { useState, useEffect } from "react";
import axios from "../utils/axios";
import {
  MdDelete as DeleteIcon,
  MdBlock as BlockIcon,
  MdCheckCircle as CheckCircleIcon,
  MdCancel as CancelIcon,
  MdStar as StarIcon,
  MdPerson as PersonIcon,
  MdBusiness as BusinessIcon,
  MdRateReview as ReviewIcon,
  MdDashboard as DashboardIcon,
  MdTrendingUp as TrendingUpIcon,
  MdPeople as PeopleIcon,
  MdInventory as InventoryIcon,
} from "react-icons/md";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "user" | "moderator" | "admin";
  isActive: boolean;
  isEmailVerified: boolean;
  kycStatus: "pending" | "verified" | "rejected";
  createdAt: string;
  lastLogin?: string;
}

interface Product {
  _id: string;
  title: string;
  assetType: string;
  category: string;
  totalValue: number;
  availableShares: number;
  totalShares: number;
  status: "draft" | "pending" | "active" | "sold" | "suspended";
  isFeatured: boolean;
  createdAt: string;
  owner: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface Review {
  _id: string;
  title: string;
  content: string;
  rating: number;
  category: string;
  status: "pending" | "approved" | "rejected";
  isFeatured: boolean;
  createdAt: string;
  author: {
    firstName: string;
    lastName: string;
    email: string;
  };
  helpfulVotes: number;
}

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalReviews: number;
  activeUsers: number;
  pendingProducts: number;
  pendingReviews: number;
  totalValue: number;
  monthlyGrowth: number;
}

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({ open: false, message: "", severity: "success" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, productsRes, reviewsRes, statsRes] = await Promise.all([
        axios.get("/admin/users"),
        axios.get("/admin/products"),
        axios.get("/admin/reviews"),
        axios.get("/admin/dashboard"),
      ]);

      // Defensive logging
      console.log("API users response:", usersRes.data?.data?.users);
      setUsers(usersRes.data?.data?.users || []);
      setProducts(productsRes.data?.data?.products || []);
      setReviews(reviewsRes.data?.data?.reviews || []);
      setStats(statsRes.data?.data || null);
    } catch (error) {
      console.error("Error fetching admin data:", error);
      showSnackbar("Error loading data", "error");
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (
    message: string,
    severity: "success" | "error" | "info"
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleTabChange = (newValue: number) => {
    setActiveTab(newValue);
  };

  // User management functions
  const handleUserAction = async (
    userId: string,
    action: "ban" | "unban" | "delete",
    role?: string
  ) => {
    try {
      if (action === "delete") {
        await axios.delete(`/admin/users/${userId}`);
        showSnackbar("User deleted successfully", "success");
      } else if (action === "ban" || action === "unban") {
        await axios.patch(`/admin/users/${userId}`, {
          isActive: action === "unban",
        });
        showSnackbar(
          `User ${action === "ban" ? "banned" : "unbanned"} successfully`,
          "success"
        );
      } else if (role) {
        await axios.patch(`/admin/users/${userId}`, { role });
        showSnackbar("User role updated successfully", "success");
      }
      fetchData();
    } catch (error) {
      console.error("Error performing user action:", error);
      showSnackbar("Error performing action", "error");
    }
  };

  const handleProductAction = async (
    productId: string,
    action: "approve" | "reject" | "delete" | "feature"
  ) => {
    try {
      if (action === "delete") {
        await axios.delete(`/admin/products/${productId}`);
        showSnackbar("Product deleted successfully", "success");
      } else if (action === "approve" || action === "reject") {
        await axios.put(`/admin/products/${productId}/status`, {
          status: action === "approve" ? "active" : "suspended",
        });
        showSnackbar(
          `Product ${
            action === "approve" ? "approved" : "rejected"
          } successfully`,
          "success"
        );
      } else if (action === "feature") {
        await axios.put(`/admin/products/${productId}/feature`, {
          isFeatured: true,
        });
        showSnackbar("Product featured successfully", "success");
      }
      fetchData();
    } catch (error) {
      console.error("Error performing product action:", error);
      showSnackbar("Error performing action", "error");
    }
  };

  const handleReviewAction = async (
    reviewId: string,
    action: "approve" | "reject" | "delete" | "feature"
  ) => {
    try {
      if (action === "delete") {
        await axios.delete(`/admin/reviews/${reviewId}`);
        showSnackbar("Review deleted successfully", "success");
      } else if (action === "approve" || action === "reject") {
        await axios.put(`/admin/reviews/${reviewId}/status`, {
          status: action === "approve" ? "approved" : "rejected",
        });
        showSnackbar(
          `Review ${
            action === "approve" ? "approved" : "rejected"
          } successfully`,
          "success"
        );
      } else if (action === "feature") {
        await axios.put(`/admin/reviews/${reviewId}/feature`, {
          isFeatured: true,
        });
        showSnackbar("Review featured successfully", "success");
      }
      fetchData();
    } catch (error) {
      console.error("Error performing review action:", error);
      showSnackbar("Error performing action", "error");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "approved":
      case "verified":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
      case "banned":
      case "suspended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const DashboardTab = () => (
    <div className="space-y-6">
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <PeopleIcon className="text-blue-600 mr-4" size={24} />
              <div>
                <h3 className="text-2xl font-bold">{stats.totalUsers}</h3>
                <p className="text-gray-600">Total Users</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <InventoryIcon className="text-blue-600 mr-4" size={24} />
              <div>
                <h3 className="text-2xl font-bold">{stats.totalProducts}</h3>
                <p className="text-gray-600">Total Products</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ReviewIcon className="text-blue-600 mr-4" size={24} />
              <div>
                <h3 className="text-2xl font-bold">{stats.totalReviews}</h3>
                <p className="text-gray-600">Total Reviews</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <TrendingUpIcon className="text-blue-600 mr-4" size={24} />
              <div>
                <h3 className="text-2xl font-bold">
                  {formatCurrency(stats.totalValue)}
                </h3>
                <p className="text-gray-600">Total Value</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Pending Actions</h3>
          <div className="space-y-2">
            <p className="text-gray-600">
              Pending Products: {stats?.pendingProducts || 0}
            </p>
            <p className="text-gray-600">
              Pending Reviews: {stats?.pendingReviews || 0}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Platform Growth</h3>
          <p className="text-3xl font-bold text-blue-600">
            +{stats?.monthlyGrowth || 0}%
          </p>
          <p className="text-gray-600">Monthly user growth</p>
        </div>
      </div>
    </div>
  );

  const UsersTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">User Management</h2>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  KYC
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.isArray(users) &&
                users.map((user) => (
                  <tr key={user._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <PersonIcon className="text-gray-600" size={20} />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === "admin"
                            ? "bg-red-100 text-red-800"
                            : user.role === "moderator"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.isActive ? "Active" : "Banned"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          user.kycStatus
                        )}`}
                      >
                        {user.kycStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            handleUserAction(
                              user._id,
                              user.isActive ? "ban" : "unban"
                            )
                          }
                          className={`p-1 rounded ${
                            user.isActive
                              ? "text-red-600 hover:text-red-900"
                              : "text-green-600 hover:text-green-900"
                          }`}
                          title={user.isActive ? "Ban User" : "Unban User"}
                        >
                          {user.isActive ? (
                            <BlockIcon size={16} />
                          ) : (
                            <CheckCircleIcon size={16} />
                          )}
                        </button>

                        <button
                          onClick={() => handleUserAction(user._id, "delete")}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="Delete User"
                        >
                          <DeleteIcon size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const ProductsTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Product Management</h2>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shares
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Featured
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {product.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {product.category}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.assetType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(product.totalValue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.availableShares}/{product.totalShares}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        product.status
                      )}`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.isFeatured
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {product.isFeatured ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.owner.firstName} {product.owner.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {product.status === "pending" && (
                        <>
                          <button
                            onClick={() =>
                              handleProductAction(product._id, "approve")
                            }
                            className="text-green-600 hover:text-green-900 p-1 rounded"
                            title="Approve"
                          >
                            <CheckCircleIcon size={16} />
                          </button>
                          <button
                            onClick={() =>
                              handleProductAction(product._id, "reject")
                            }
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                            title="Reject"
                          >
                            <CancelIcon size={16} />
                          </button>
                        </>
                      )}

                      <button
                        onClick={() =>
                          handleProductAction(product._id, "delete")
                        }
                        className="text-red-600 hover:text-red-900 p-1 rounded"
                        title="Delete"
                      >
                        <DeleteIcon size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const ReviewsTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Review Management</h2>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Review
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Featured
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reviews.map((review) => (
                <tr key={review._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {review.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {review.content.substring(0, 50)}...
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`${
                            i < review.rating
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                          size={16}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      {review.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        review.status
                      )}`}
                    >
                      {review.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        review.isFeatured
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {review.isFeatured ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {review.author ? (
                      `${review.author.firstName} ${review.author.lastName}`
                    ) : (
                      <span className="italic text-gray-400">Unknown</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(review.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {review.status === "pending" && (
                        <>
                          <button
                            onClick={() =>
                              handleReviewAction(review._id, "approve")
                            }
                            className="text-green-600 hover:text-green-900 p-1 rounded"
                            title="Approve"
                          >
                            <CheckCircleIcon size={16} />
                          </button>
                          <button
                            onClick={() =>
                              handleReviewAction(review._id, "reject")
                            }
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                            title="Reject"
                          >
                            <CancelIcon size={16} />
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => handleReviewAction(review._id, "delete")}
                        className="text-red-600 hover:text-red-900 p-1 rounded"
                        title="Delete"
                      >
                        <DeleteIcon size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => handleTabChange(0)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 0
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center">
                <DashboardIcon className="mr-2" size={20} />
                Dashboard
              </div>
            </button>
            <button
              onClick={() => handleTabChange(1)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 1
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center">
                <PeopleIcon className="mr-2" size={20} />
                Users
              </div>
            </button>
            <button
              onClick={() => handleTabChange(2)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 2
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center">
                <BusinessIcon className="mr-2" size={20} />
                Products
              </div>
            </button>
            <button
              onClick={() => handleTabChange(3)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 3
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center">
                <ReviewIcon className="mr-2" size={20} />
                Reviews
              </div>
            </button>
          </nav>
        </div>
      </div>

      <div className="mt-6">
        {activeTab === 0 && <DashboardTab />}
        {activeTab === 1 && <UsersTab />}
        {activeTab === 2 && <ProductsTab />}
        {activeTab === 3 && <ReviewsTab />}
      </div>

      {snackbar.open && (
        <div
          className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${
            snackbar.severity === "success"
              ? "bg-green-500 text-white"
              : snackbar.severity === "error"
              ? "bg-red-500 text-white"
              : "bg-blue-500 text-white"
          }`}
        >
          {snackbar.message}
          <button
            onClick={() => setSnackbar({ ...snackbar, open: false })}
            className="ml-4 text-white hover:text-gray-200"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
