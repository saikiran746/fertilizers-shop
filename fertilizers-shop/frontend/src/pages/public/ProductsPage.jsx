import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { fetchProducts, fetchCategories } from "../../api/products";
import ProductCard from "../../components/ui/ProductCard";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const ALL = "All Categories";

export default function ProductsPage() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get("search") || "");
  const [category, setCategory] = useState(params.get("category") || "");
  const [page, setPage] = useState(1);

  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });

  const { data, isLoading } = useQuery({
    queryKey: ["products", search, category, page],
    queryFn: () => fetchProducts({ search, category, page, limit: 12 }),
    keepPreviousData: true,
  });

  useEffect(() => {
    const p = {};
    if (search) p.search = search;
    if (category) p.category = category;
    setParams(p);
    setPage(1);
  }, [search, category]);

  const products = data?.products || [];
  const totalPages = data?.pages || 1;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-hero-gradient py-14 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-heading font-bold text-white mb-2">Our Products</h1>
          <p className="text-green-200">Premium fertilizers for every crop and season</p>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value === ALL ? "" : e.target.value)}
            className="input-field sm:w-56"
          >
            <option value="">{ALL}</option>
            {(categories || []).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {(search || category) && (
            <button onClick={() => { setSearch(""); setCategory(""); }} className="px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg">
              ✕ Clear
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setCategory("")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${!category ? "bg-brand-green text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-brand-green"}`}
          >
            All
          </button>
          {(categories || []).map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${category === c ? "bg-brand-green text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-brand-green"}`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Results count */}
        {!isLoading && (
          <p className="text-gray-500 text-sm mb-6">
            {data?.total || 0} product{(data?.total || 0) !== 1 ? "s" : ""} found
          </p>
        )}

        {/* Grid */}
        {isLoading ? (
          <LoadingSpinner text="Loading products..." />
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🌿</div>
            <p className="text-gray-500 text-lg">No products found.</p>
            <p className="text-gray-400 text-sm mt-1">Try a different search or category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p, i) => (
              <motion.div key={p._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <ProductCard product={p} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`w-10 h-10 rounded-lg font-medium text-sm transition-all ${n === page ? "bg-brand-green text-white" : "bg-white border border-gray-200 hover:border-brand-green text-gray-600"}`}
              >
                {n}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
