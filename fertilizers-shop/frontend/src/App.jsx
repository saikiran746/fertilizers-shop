import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import AdminLayout from "./components/layout/AdminLayout";
import RequireAuth from "./components/auth/RequireAuth";

import HomePage from "./pages/public/HomePage";
import ProductsPage from "./pages/public/ProductsPage";
import ProductDetailPage from "./pages/public/ProductDetailPage";
import AboutPage from "./pages/public/AboutPage";
import ContactPage from "./pages/public/ContactPage";
import BookingPage from "./pages/public/BookingPage";

import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import AdminProductFormPage from "./pages/admin/AdminProductFormPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import AdminNotificationsPage from "./pages/admin/AdminNotificationsPage";
import AdminBookingsPage from "./pages/admin/AdminBookingsPage";
import AdminPreviewPage from "./pages/admin/AdminPreviewPage";

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<><Navbar /><HomePage /><Footer /></>} />
      <Route path="/products" element={<><Navbar /><ProductsPage /><Footer /></>} />
      <Route path="/products/:id" element={<><Navbar /><ProductDetailPage /><Footer /></>} />
      <Route path="/about" element={<><Navbar /><AboutPage /><Footer /></>} />
      <Route path="/contact" element={<><Navbar /><ContactPage /><Footer /></>} />
      <Route path="/book" element={<BookingPage />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin/*" element={
        <RequireAuth>
          <AdminLayout>
            <Routes>
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="products/new" element={<AdminProductFormPage />} />
              <Route path="products/:id/edit" element={<AdminProductFormPage />} />
              <Route path="notifications" element={<AdminNotificationsPage />} />
              <Route path="bookings" element={<AdminBookingsPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
              <Route path="preview" element={<AdminPreviewPage />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </AdminLayout>
        </RequireAuth>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
