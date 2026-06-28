import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;
const PHONE = import.meta.env.VITE_CONTACT_PHONE || "+91-98765-43210";

const CATEGORY_COLORS = {
  "Primary Nutrients": "bg-green-100 text-green-700",
  "Organic Fertilizers": "bg-emerald-100 text-emerald-700",
  "Secondary Nutrients": "bg-teal-100 text-teal-700",
  "Water Soluble Fertilizers": "bg-blue-100 text-blue-700",
  "Micronutrients": "bg-purple-100 text-purple-700",
  "Bio Fertilizer Products": "bg-yellow-100 text-yellow-700",
};

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const imgUrl = product.image ? `${SERVER_URL}${product.image}` : null;
  const badgeColor = CATEGORY_COLORS[product.category] || "bg-gray-100 text-gray-700";

  return (
    <motion.div
      className="card group"
      whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.12)" }}
      transition={{ duration: 0.2 }}
    >
      <Link to={`/products/${product._id}`} className="block">
        <div className="aspect-[4/3] overflow-hidden bg-green-50 img-placeholder">
          {imgUrl ? (
            <img
              src={imgUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">🌿</div>
          )}
        </div>
      </Link>
      <div className="p-5">
        <span className={`badge ${badgeColor} mb-2`}>{product.category}</span>
        <Link to={`/products/${product._id}`}>
          <h3 className="font-bold text-lg text-gray-800 hover:text-brand-green transition-colors line-clamp-1 mt-1">
            {product.name}
          </h3>
        </Link>
        <p className="text-gray-500 text-sm mt-1 line-clamp-2">{product.description}</p>
        <div className="flex gap-2 mt-4">
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
