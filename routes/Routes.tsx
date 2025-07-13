import { Routes, Route } from "react-router-dom";
import LandingPage from "../src/components/pages/LandingPage";
import LoginPage from "../src/components/pages/LoginPage";
import RegisterPage from "../src/components/pages/RegisterPage";
import ForgotPassword from "../src/components/pages/ForgotPassword";
import ResetPassword from "../src/components/pages/ResetPassword";
import Home from "../src/components/pages/Home";
import Contact from "../src/components/pages/Contact";
import Listings from "../src/components/pages/Listings";
import Product from "@/components/pages/Product";
import CreateProduct from "@/components/pages/CreateProduct";
import EditProduct from "@/components/pages/EditProduct";
import OAuthCallback from "@/components/pages/OAuthCallback";
import AdminPage from "@/components/AdminPage";
import ProtectedRoute from "@/components/ProtectedRoute";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route
      path="/admin"
      element={
        <ProtectedRoute requiredRole="admin">
          <AdminPage />
        </ProtectedRoute>
      }
    />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password" element={<ResetPassword />} />
    <Route path="/home" element={<Home />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="/listings" element={<Listings />} />
    <Route path="/product/:id" element={<Product />} />
    <Route path="/create" element={<CreateProduct />} />
    <Route path="/edit-product/:id" element={<EditProduct />} />
    <Route path="/oauth-callback" element={<OAuthCallback />} />
  </Routes>
);

export default AppRoutes;
