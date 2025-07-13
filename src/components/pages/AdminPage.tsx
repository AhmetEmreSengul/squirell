import { useState, useEffect } from "react";
import Navbar from "../layouts/Navbar";
import SideBar from "../layouts/SideBar";
import Footer from "../layouts/Footer";
import axios from "../../utils/axios";

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalReviews: number;
  pendingReviews: number;
  bannedUsers: number;
  activeProducts: number;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isBanned: boolean;
  createdAt: string;
}

interface Product {
  _id: string;
  title: string;
  status: string;
  owner: {
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
}

interface Review {
  _id: string;
  title: string;
  rating: number;
  status: string;
  author: {
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
}

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get("/admin/dashboard");
      if (response.data.success) {
        const { userStats, productStats, reviewStats } = response.data.data;
        setStats({
          totalUsers: userStats.totalUsers || 0,
          totalProducts: productStats.totalProducts || 0,
          totalReviews: reviewStats.totalReviews || 0,
          pendingReviews: reviewStats.totalPending || 0,
          bannedUsers: userStats.bannedUsers || 0,
          activeProducts: productStats.activeProducts || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get("/admin/users");
      if (response.data.success) {
        setUsers(response.data.data.users || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get("/admin/products");
      if (response.data.success) {
        setProducts(response.data.data.products || []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get("/admin/reviews");
      if (response.data.success) {
        setReviews(response.data.data.reviews || []);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "users") fetchUsers();
    if (tab === "products") fetchProducts();
    if (tab === "reviews") fetchReviews();
  };

  const banUser = async (userId: string, isBanned: boolean) => {
    try {
      const response = await axios.put(`/admin/users/${userId}/ban`, {
        isBanned,
      });
      if (response.status === 200) {
        fetchUsers();
      }
    } catch (error) {
      console.error("Error banning user:", error);
    }
  };

  const approveReview = async (reviewId: string, isApproved: boolean) => {
    try {
      const status = isApproved ? "approved" : "rejected";
      const response = await axios.put(`/admin/reviews/${reviewId}/status`, {
        status,
      });
      if (response.status === 200) {
        fetchReviews();
      }
    } catch (error) {
      console.error("Error approving review:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex md:hidden z-[50] fixed top-0 left-0">
          <SideBar />
        </div>
        <div className="md:flex hidden w-screen left-0 fixed backdrop-blur-sm bg-black/15 z-50">
          <Navbar />
        </div>
        <div className="mt-40 flex justify-center">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex md:hidden z-[50] fixed top-0 left-0">
        <SideBar />
      </div>
      <div className="md:flex hidden w-screen left-0 fixed backdrop-blur-sm bg-black/15 z-50">
        <Navbar />
      </div>

      <div className="mt-40 px-4 md:px-8">
        <h1 className="text-4xl text-white mb-8">Admin Dashboard</h1>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => handleTabChange("dashboard")}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === "dashboard"
                ? "bg-green-600 text-white"
                : "bg-gray-600 text-white hover:bg-gray-700"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => handleTabChange("users")}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === "users"
                ? "bg-green-600 text-white"
                : "bg-gray-600 text-white hover:bg-gray-700"
            }`}
          >
            Users
          </button>
          <button
            onClick={() => handleTabChange("products")}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === "products"
                ? "bg-green-600 text-white"
                : "bg-gray-600 text-white hover:bg-gray-700"
            }`}
          >
            Products
          </button>
          <button
            onClick={() => handleTabChange("reviews")}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === "reviews"
                ? "bg-green-600 text-white"
                : "bg-gray-600 text-white hover:bg-gray-700"
            }`}
          >
            Reviews
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl text-white mb-2">Total Users</h3>
              <p className="text-3xl font-bold text-green-400">
                {stats.totalUsers}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl text-white mb-2">Total Products</h3>
              <p className="text-3xl font-bold text-green-400">
                {stats.totalProducts}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl text-white mb-2">Total Reviews</h3>
              <p className="text-3xl font-bold text-green-400">
                {stats.totalReviews}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl text-white mb-2">Pending Reviews</h3>
              <p className="text-3xl font-bold text-yellow-400">
                {stats.pendingReviews}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl text-white mb-2">Banned Users</h3>
              <p className="text-3xl font-bold text-red-400">
                {stats.bannedUsers}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl text-white mb-2">Active Products</h3>
              <p className="text-3xl font-bold text-green-400">
                {stats.activeProducts}
              </p>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h2 className="text-2xl text-white mb-4">User Management</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-white">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">Role</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-b border-gray-600">
                      <td className="p-2">{`${user.firstName} ${user.lastName}`}</td>
                      <td className="p-2">{user.email}</td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            user.role === "admin"
                              ? "bg-purple-600"
                              : "bg-blue-600"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            user.isBanned ? "bg-red-600" : "bg-green-600"
                          }`}
                        >
                          {user.isBanned ? "Banned" : "Active"}
                        </span>
                      </td>
                      <td className="p-2">
                        <button
                          onClick={() => banUser(user._id, !user.isBanned)}
                          className={`px-3 py-1 rounded text-xs ${
                            user.isBanned
                              ? "bg-green-600 hover:bg-green-700"
                              : "bg-red-600 hover:bg-red-700"
                          }`}
                        >
                          {user.isBanned ? "Unban" : "Ban"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === "products" && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h2 className="text-2xl text-white mb-4">Product Management</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-white">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left p-2">Title</th>
                    <th className="text-left p-2">Owner</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id} className="border-b border-gray-600">
                      <td className="p-2">{product.title}</td>
                      <td className="p-2">{`${product.owner.firstName} ${product.owner.lastName}`}</td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            product.status === "active"
                              ? "bg-green-600"
                              : "bg-gray-600"
                          }`}
                        >
                          {product.status}
                        </span>
                      </td>
                      <td className="p-2">
                        {new Date(product.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === "reviews" && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h2 className="text-2xl text-white mb-4">Review Management</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-white">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left p-2">Title</th>
                    <th className="text-left p-2">Author</th>
                    <th className="text-left p-2">Rating</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((review) => (
                    <tr key={review._id} className="border-b border-gray-600">
                      <td className="p-2">{review.title}</td>
                      <td className="p-2">{`${review.author.firstName} ${review.author.lastName}`}</td>
                      <td className="p-2">
                        <span className="text-yellow-400">
                          {"★".repeat(review.rating)}
                        </span>
                      </td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            review.status === "approved"
                              ? "bg-green-600"
                              : review.status === "rejected"
                              ? "bg-red-600"
                              : "bg-yellow-600"
                          }`}
                        >
                          {review.status}
                        </span>
                      </td>
                      <td className="p-2">
                        <button
                          onClick={() =>
                            approveReview(
                              review._id,
                              review.status !== "approved"
                            )
                          }
                          className={`px-3 py-1 rounded text-xs ${
                            review.status === "approved"
                              ? "bg-red-600 hover:bg-red-700"
                              : "bg-green-600 hover:bg-green-700"
                          }`}
                        >
                          {review.status === "approved" ? "Reject" : "Approve"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <footer className="mt-20 w-full h-40 flex border-t-1 bg-gradient-to-b from-[#a09c9c] via-[#7bb77b] to-[#168516]">
        <Footer />
      </footer>
    </div>
  );
};

export default AdminPage;
