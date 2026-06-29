import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { fetchProduct } from "../../api/products";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const PHONE = import.meta.env.VITE_CONTACT_PHONE || "+91-98765-43210";
const rawBaseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "/api";
const SERVER_URL = rawBaseUrl.endsWith('/api') ? rawBaseUrl.slice(0, -4) : rawBaseUrl;

export default function ProductDetailPage() {
  const { id } = useParams();
  const [showPopup, setShowPopup] = useState(false);

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

  const imgUrl = product.image ? `${SERVER_URL}${product.image}` : null;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <Link to="/products" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-green mb-8">
          ← Back to Products
        </Link>
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden grid md:grid-cols-2 gap-0">
          {/* Image */}
          <div className="aspect-square bg-green-50 img-placeholder flex items-center justify-center">
            {imgUrl ? (
              <img src={imgUrl} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="text-9xl">🌿</div>
            )}
          </div>
          {/* Info */}
          <div className="p-8 flex flex-col justify-center">
            <span className="badge bg-primary-100 text-primary-700 mb-3">{product.category}</span>
            <h1 className="text-3xl font-heading font-bold text-gray-800 mb-4">{product.name}</h1>
            <p className="text-gray-600 leading-relaxed mb-8">{product.description}</p>
            <div className="bg-green-50 rounded-2xl p-5 mb-6 border border-green-100">
              <p className="text-sm text-gray-600 mb-1">To order this product, call:</p>
              <a href={`tel:${PHONE}`} className="text-2xl font-bold text-brand-green hover:text-brand-dark">{PHONE}</a>
            </div>
            <button onClick={() => setShowPopup(true)} className="btn-primary w-full justify-center text-base py-4">
              📞 Call to Order
            </button>
          </div>
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
              <p className="text-gray-500 text-sm mb-5">Call us to place your order for <strong>{product.name}</strong></p>
              <a href={`tel:${PHONE}`} className="btn-primary w-full justify-center text-lg py-4 mb-3">{PHONE}</a>
              <button onClick={() => setShowPopup(false)} className="text-sm text-gray-400 hover:text-gray-600">Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
