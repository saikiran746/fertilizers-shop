import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const rawBaseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "/api";
const SERVER_URL = rawBaseUrl.endsWith('/api') ? rawBaseUrl.slice(0, -4) : rawBaseUrl;
const PHONE = import.meta.env.VITE_CONTACT_PHONE || "+91-98765-43210";

const CATEGORY_COLORS = {
  "Urea Fertilizers":          "bg-yellow-100 text-yellow-800",
  "DAP Fertilizers":           "bg-orange-100 text-orange-800",
  "NPK Fertilizers":           "bg-blue-100 text-blue-800",
  "Organic Fertilizers":       "bg-emerald-100 text-emerald-800",
  "Potash Fertilizers":        "bg-purple-100 text-purple-800",
  "Micronutrients":            "bg-pink-100 text-pink-800",
  "Bio Fertilizers":           "bg-teal-100 text-teal-800",
  "Soil Conditioners":         "bg-amber-100 text-amber-800",
  "Plant Growth Promoters":    "bg-green-100 text-green-800",
  "Crop Protection Nutrients": "bg-red-100 text-red-800",
  // legacy fallbacks
  "Primary Nutrients":         "bg-green-100 text-green-700",
  "Secondary Nutrients":       "bg-teal-100 text-teal-700",
  "Water Soluble Fertilizers": "bg-blue-100 text-blue-700",
  "Bio Fertilizer Products":   "bg-yellow-100 text-yellow-700",
};

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const imgUrl = product.image
    ? product.image.startsWith("http")
      ? product.image
      : `${SERVER_URL}${product.image}`
    : null;
  const badgeColor = CATEGORY_COLORS[product.category] || "bg-gray-100 text-gray-700";

  return (
    <motion.div
      className="card group flex flex-col h-full"
      whileHover={{ y: -5, boxShadow: "0 24px 48px rgba(0,0,0,0.14)" }}
      transition={{ duration: 0.2 }}
    >
      <Link to={`/products/${product._id}`} className="block flex-shrink-0">
        <div className="aspect-[4/3] overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 img-placeholder relative">
          {imgUrl ? (
            <img
              src={imgUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
          ) : null}
          <div
            className="w-full h-full flex items-center justify-center text-6xl"
            style={{ display: imgUrl ? "none" : "flex" }}
          >
            🌿
          </div>
          {/* Stock badge */}
          <div className="absolute top-2 right-2">
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full shadow-sm ${
                product.inStock !== false
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"
              }`}
            >
              {product.inStock !== false ? "In Stock" : "Out of Stock"}
            </span>
          </div>
        </div>
      </Link>

      <div className="p-5 flex flex-col flex-1">
        <span className={`badge ${badgeColor} mb-2 self-start`}>{product.category}</span>
        <Link to={`/products/${product._id}`}>
          <h3 className="font-bold text-lg text-gray-800 hover:text-brand-green transition-colors line-clamp-2 mt-1 leading-snug">
            {product.name}
          </h3>
        </Link>
        <p className="text-gray-500 text-sm mt-2 line-clamp-2 flex-1">{product.description}</p>

        {/* Price */}
        <div className="mt-3 mb-4">
          {product.price > 0 ? (
            <span className="text-2xl font-extrabold text-brand-green">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
          ) : (
            <span className="text-sm text-gray-400 italic">Price on request</span>
          )}
        </div>

        <div className="flex gap-2 mt-auto">
          <a
            href={`tel:${PHONE}`}
            className="flex-1 btn-primary justify-center text-sm py-2.5 bg-emerald-600 hover:bg-emerald-700"
          >
            📞 Call
          </a>
          <button
            onClick={() => navigate(`/book?product=${product._id}`)}
            className="flex-1 btn-primary justify-center text-sm py-2.5"
          >
            📝 Book
          </button>
        </div>
      </div>
    </motion.div>
  );
}
