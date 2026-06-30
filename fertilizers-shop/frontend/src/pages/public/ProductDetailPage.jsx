import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { fetchProduct } from "../../api/products";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const PHONE = import.meta.env.VITE_CONTACT_PHONE || "+91-98765-43210";
const rawBaseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "/api";
const SERVER_URL = rawBaseUrl.endsWith('/api') ? rawBaseUrl.slice(0, -4) : rawBaseUrl;

const CATEGORY_COLORS = {
  "Urea Fertilizers":          "bg-yellow-100 text-yellow-800 border-yellow-200",
  "DAP Fertilizers":           "bg-orange-100 text-orange-800 border-orange-200",
  "NPK Fertilizers":           "bg-blue-100 text-blue-800 border-blue-200",
  "Organic Fertilizers":       "bg-emerald-100 text-emerald-800 border-emerald-200",
  "Potash Fertilizers":        "bg-purple-100 text-purple-800 border-purple-200",
  "Micronutrients":            "bg-pink-100 text-pink-800 border-pink-200",
  "Bio Fertilizers":           "bg-teal-100 text-teal-800 border-teal-200",
  "Soil Conditioners":         "bg-amber-100 text-amber-800 border-amber-200",
  "Plant Growth Promoters":    "bg-green-100 text-green-800 border-green-200",
  "Crop Protection Nutrients": "bg-red-100 text-red-800 border-red-200",
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const [showPopup, setShowPopup] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProduct(id),
  });

  if (isLoading) return <LoadingSpinner text="Loading product..." />;
  if (isError || !product) return (
    <div className="text-center py-24">
      <div className="text-6xl mb-4">😕</div>
      <p className="text-gray-500 text-lg mb-4">Product not found.</p>
      <Link to="/products" className="btn-outline">← Back to Products</Link>
    </div>
  );

  const imgUrl = product.image
    ? product.image.startsWith("http")
      ? product.image
      : `${SERVER_URL}${product.image}`
    : null;
  const badgeColor = CATEGORY_COLORS[product.category] || "bg-gray-100 text-gray-800 border-gray-200";

  const tabs = [
    { key: "description", label: "Description" },
    ...(product.benefits ? [{ key: "benefits", label: "Benefits" }] : []),
    ...(product.usageInstructions ? [{ key: "usage", label: "Usage Instructions" }] : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Link to="/" className="hover:text-brand-green transition-colors">Home</Link>
          <span>›</span>
          <Link to="/products" className="hover:text-brand-green transition-colors">Products</Link>
          <span>›</span>
          <span className="text-gray-600 truncate max-w-[200px]">{product.name}</span>
        </div>

        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Image */}
            <div className="aspect-square bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center relative overflow-hidden">
              {imgUrl ? (
                <img
                  src={imgUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className="w-full h-full flex items-center justify-center text-9xl"
                style={{ display: imgUrl ? "none" : "flex" }}
              >
                🌿
              </div>
              {/* Stock overlay */}
              <div className="absolute top-4 left-4">
                <span className={`text-sm font-semibold px-3 py-1 rounded-full shadow ${
                  product.inStock !== false ? "bg-green-500 text-white" : "bg-red-500 text-white"
                }`}>
                  {product.inStock !== false ? "✓ In Stock" : "✗ Out of Stock"}
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="p-8 md:p-10 flex flex-col justify-between">
              <div>
                {/* Category badge */}
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border mb-4 ${badgeColor}`}>
                  🌱 {product.category}
                </span>

                {/* Name */}
                <h1 className="text-2xl md:text-3xl font-heading font-bold text-gray-800 mb-3 leading-tight">
                  {product.name}
                </h1>

                {/* Price */}
                <div className="flex items-baseline gap-3 mb-6">
                  {product.price > 0 ? (
                    <>
                      <span className="text-4xl font-extrabold text-brand-green">
                        ₹{product.price.toLocaleString("en-IN")}
                      </span>
                      <span className="text-gray-400 text-sm">per unit</span>
                    </>
                  ) : (
                    <span className="text-gray-400 italic">Price on request</span>
                  )}
                </div>

                {/* Stock quantity */}
                {product.stockQuantity > 0 && (
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-sm text-gray-500">
                      {product.stockQuantity} units available
                    </span>
                  </div>
                )}

                {/* Divider */}
                <div className="border-t border-gray-100 my-6" />

                {/* CTA */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 mb-5 border border-green-100">
                  <p className="text-sm text-gray-600 mb-1 font-medium">📞 Call to Order</p>
                  <a
                    href={`tel:${PHONE}`}
                    className="text-2xl font-bold text-brand-green hover:text-brand-dark transition-colors"
                  >
                    {PHONE}
                  </a>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowPopup(true)}
                  className="btn-primary flex-1 justify-center text-base py-4"
                >
                  📞 Call to Order
                </button>
                <Link
                  to={`/book?product=${product._id}`}
                  className="btn-outline flex-1 justify-center text-base py-4 text-center"
                >
                  📝 Book Now
                </Link>
              </div>
            </div>
          </div>

          {/* Tabs */}
          {tabs.length > 0 && (
            <div className="border-t border-gray-100">
              {/* Tab headers */}
              <div className="flex border-b border-gray-100 px-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-6 py-4 text-sm font-semibold transition-all border-b-2 -mb-px ${
                      activeTab === tab.key
                        ? "border-brand-green text-brand-green"
                        : "border-transparent text-gray-400 hover:text-gray-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="p-8">
                {activeTab === "description" && (
                  <p className="text-gray-600 leading-relaxed text-base whitespace-pre-line">
                    {product.description}
                  </p>
                )}
                {activeTab === "benefits" && (
                  <div className="space-y-3">
                    {(product.benefits || "").split("\n").filter(Boolean).map((line, i) => (
                      <div key={i} className="flex items-start gap-3 bg-green-50 rounded-xl p-3 border border-green-100">
                        <span className="text-green-600 mt-0.5 flex-shrink-0">✓</span>
                        <p className="text-gray-700 text-sm">{line.replace(/^[•\-]\s*/, "")}</p>
                      </div>
                    ))}
                  </div>
                )}
                {activeTab === "usage" && (
                  <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">📋</span>
                      <h3 className="font-bold text-blue-900">Application Guide</h3>
                    </div>
                    <p className="text-blue-800 text-sm leading-relaxed whitespace-pre-line">
                      {product.usageInstructions}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Call Popup */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowPopup(false)}
          >
            <motion.div
              className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-5xl mb-4">📞</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Place Your Order</h3>
              <p className="text-gray-500 text-sm mb-5">
                Call us to place your order for <strong>{product.name}</strong>
              </p>
              <a href={`tel:${PHONE}`} className="btn-primary w-full justify-center text-lg py-4 mb-3">
                {PHONE}
              </a>
              <button onClick={() => setShowPopup(false)} className="text-sm text-gray-400 hover:text-gray-600">
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
