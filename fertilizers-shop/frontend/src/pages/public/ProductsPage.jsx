import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { fetchProducts, fetchCategories } from "../../api/products";
import ProductCard from "../../components/ui/ProductCard";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const ALL = "All Categories";

const CATEGORY_ICONS = {
  "Urea Fertilizers":          "🟡",
  "DAP Fertilizers":           "🟠",
  "NPK Fertilizers":           "🔵",
  "Organic Fertilizers":       "🟢",
  "Potash Fertilizers":        "🟣",
  "Micronutrients":            "🩷",
  "Bio Fertilizers":           "🩵",
  "Soil Conditioners":         "🟤",
  "Plant Growth Promoters":    "💚",
  "Crop Protection Nutrients": "🔴",
};

export default function ProductsPage() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get("search") || "");
  const [category, setCategory] = useState(params.get("category") || "");
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["products", debouncedSearch, category, page],
    queryFn: () => fetchProducts({ search: debouncedSearch, category, page, limit: 12 }),
    keepPreviousData: true,
  });

  useEffect(() => {
    const p = {};
    if (debouncedSearch) p.search = debouncedSearch;
    if (category) p.category = category;
    setParams(p);
    setPage(1);
  }, [debouncedSearch, category]);

  const products = data?.products || [];
  const totalPages = data?.pages || 1;

  const handleCategoryChange = (cat) => {
    setCategory(cat === ALL ? "" : cat);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-hero-gradient py-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-8 left-1/4 text-8xl">🌾</div>
          <div className="absolute top-4 right-1/4 text-6xl">🌱</div>
          <div className="absolute bottom-4 left-1/3 text-7xl">🌿</div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-3">
            Our Products
          </h1>
          <p className="text-green-200 text-lg">
            Premium fertilizers for every crop and season
          </p>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Search + filter bar */}
        <motion.div
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          {/* Search input */}
          <div className="flex-1 relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
            <input
              id="products-search"
              type="text"
              placeholder="Search by product name or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10 pr-4"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors text-lg"
              >
                ×
              </button>
            )}
          </div>

          {/* Category dropdown */}
          <select
            id="products-category-select"
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value === "" ? ALL : e.target.value)}
            className="input-field sm:w-64"
          >
            <option value="">{ALL}</option>
            {(categories || []).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {(search || category) && (
            <button
              onClick={() => { setSearch(""); setCategory(""); }}
              className="px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl font-medium transition-colors border border-red-100"
            >
              ✕ Clear all
            </button>
          )}
        </motion.div>

        {/* Category Pills */}
        <motion.div
          className="flex flex-wrap gap-2 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <button
            id="cat-pill-all"
            onClick={() => handleCategoryChange(ALL)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
              !category
                ? "bg-brand-green text-white border-brand-green shadow-md shadow-green-200"
                : "bg-white border-gray-200 text-gray-600 hover:border-brand-green hover:text-brand-green"
            }`}
          >
            All
          </button>
          {(categories || []).map((c) => (
            <button
              key={c}
              id={`cat-pill-${c.replace(/\s+/g, "-").toLowerCase()}`}
              onClick={() => handleCategoryChange(c)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                category === c
                  ? "bg-brand-green text-white border-brand-green shadow-md shadow-green-200"
                  : "bg-white border-gray-200 text-gray-600 hover:border-brand-green hover:text-brand-green"
              }`}
            >
              {CATEGORY_ICONS[c] || "🌿"} {c}
            </button>
          ))}
        </motion.div>

        {/* Results count */}
        {!isLoading && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-500 text-sm">
              {category
                ? `Showing ${data?.total || 0} product${(data?.total || 0) !== 1 ? "s" : ""} in "${category}"`
                : `${data?.total || 0} product${(data?.total || 0) !== 1 ? "s" : ""} available`}
            </p>
            {debouncedSearch && (
              <p className="text-sm text-brand-green font-medium">
                Results for "{debouncedSearch}"
              </p>
            )}
          </div>
        )}

        {/* Grid */}
        {isLoading ? (
          <LoadingSpinner text="Loading products..." />
        ) : products.length === 0 ? (
          <motion.div
            className="text-center py-24 bg-white rounded-3xl shadow-sm border border-gray-100"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="text-7xl mb-5">🌿</div>
            <p className="text-gray-600 text-xl font-semibold mb-2">No products found</p>
            <p className="text-gray-400 text-sm mb-6">
              Try a different search term or browse all categories.
            </p>
            <button
              onClick={() => { setSearch(""); setCategory(""); }}
              className="btn-primary"
            >
              View All Products
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p, i) => (
              <motion.div
                key={p._id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.35 }}
              >
                <ProductCard product={p} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-14">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2.5 rounded-xl font-medium text-sm border border-gray-200 bg-white disabled:opacity-40 hover:border-brand-green transition-colors"
            >
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`w-10 h-10 rounded-xl font-semibold text-sm transition-all ${
                  n === page
                    ? "bg-brand-green text-white shadow-md shadow-green-200"
                    : "bg-white border border-gray-200 hover:border-brand-green text-gray-600"
                }`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2.5 rounded-xl font-medium text-sm border border-gray-200 bg-white disabled:opacity-40 hover:border-brand-green transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
