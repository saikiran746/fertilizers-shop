import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { adminFetchProducts, adminDeleteProduct, adminToggleVisibility } from "../../api/products";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

const CATEGORIES = [
  "All",
  "Primary Nutrients",
  "Organic Fertilizers",
  "Secondary Nutrients",
  "Water Soluble Fertilizers",
  "Micronutrients",
  "Bio Fertilizer Products",
];

export default function AdminProductsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [viewMode, setViewMode] = useState("table");
  const [deleteId, setDeleteId] = useState(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: adminFetchProducts,
  });

  const deleteMutation = useMutation({
    mutationFn: adminDeleteProduct,
    onSuccess: () => {
      toast.success("Product deleted");
      qc.invalidateQueries(["admin-products"]);
      qc.invalidateQueries(["admin-enhanced-stats"]);
      setDeleteId(null);
    },
    onError: () => toast.error("Failed to delete"),
  });

  const toggleMutation = useMutation({
    mutationFn: adminToggleVisibility,
    onSuccess: (data) => {
      toast.success(data.visible ? "Product now visible" : "Product hidden");
      qc.invalidateQueries(["admin-products"]);
      qc.invalidateQueries(["admin-enhanced-stats"]);
    },
    onError: () => toast.error("Failed to update visibility"),
  });

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-heading font-extrabold text-white tracking-tight">Products</h2>
          <p className="text-slate-400 text-sm">{products.length} total products</p>
        </div>
        <Link to="/admin/products/new" className="admin-btn py-2.5 px-5 text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Add Product
        </Link>
      </div>

      {/* Search + View Toggle */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            id="admin-products-search"
            className="admin-input pl-10"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex rounded-xl border border-white/[0.08] overflow-hidden flex-shrink-0">
          <button
            onClick={() => setViewMode("table")}
            className={`px-3.5 py-2.5 transition-colors ${viewMode === "table" ? "bg-emerald-500/20 text-emerald-400" : "text-slate-500 hover:text-slate-300 bg-white/[0.02]"}`}
            title="Table view"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`px-3.5 py-2.5 transition-colors ${viewMode === "grid" ? "bg-emerald-500/20 text-emerald-400" : "text-slate-500 hover:text-slate-300 bg-white/[0.02]"}`}
            title="Grid view"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
          </button>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-5" style={{ scrollbarWidth: "none" }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 border ${
              activeCategory === cat
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                : "bg-white/[0.03] text-slate-500 border-white/[0.06] hover:text-slate-300 hover:bg-white/[0.05]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : viewMode === "table" ? (
        /* Table View */
        <div className="admin-card overflow-hidden">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <svg className="w-12 h-12 mx-auto mb-3 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              <p className="mb-3">No products found</p>
              {products.length === 0 && (
                <Link to="/admin/products/new" className="admin-btn py-2 px-4 text-sm">Add First Product</Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-white/[0.06]">
                  <tr>
                    <th className="text-left px-5 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wider">Product</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wider hidden sm:table-cell">Category</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wider hidden sm:table-cell">Stock</th>
                    <th className="text-center px-5 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wider">Visible</th>
                    <th className="text-right px-5 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filtered.map((p) => (
                    <tr key={p._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white/[0.05] overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {p.image ? (
                              <img src={`${SERVER_URL}${p.image}`} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-white truncate max-w-[180px]">{p.name}</p>
                            <p className="text-xs text-slate-500 sm:hidden">{p.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <span className="text-xs px-2.5 py-1 rounded-lg bg-white/[0.05] text-slate-400 border border-white/[0.06]">{p.category}</span>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <span className="text-xs px-2.5 py-1 rounded-lg bg-white/[0.05] text-slate-400 border border-white/[0.06]">{p.stockQuantity || 0} unit(s)</span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => toggleMutation.mutate(p._id)}
                          disabled={toggleMutation.isPending}
                          role="switch"
                          aria-checked={p.visible}
                          className={`relative inline-flex items-center w-11 h-6 rounded-full flex-shrink-0 transition-colors duration-200 focus:outline-none ${p.visible ? "bg-emerald-500" : "bg-slate-600"}`}
                          title={p.visible ? "Click to hide" : "Click to show"}
                        >
                          <span className={`inline-block w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ${p.visible ? "translate-x-6" : "translate-x-0.5"}`} />
                        </button>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/admin/products/${p._id}/edit`} className="px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition-colors">
                            Edit
                          </Link>
                          <button onClick={() => setDeleteId(p._id)} className="px-3 py-1.5 text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center py-16 text-slate-500 admin-card">
              <p>No products found</p>
            </div>
          ) : (
            filtered.map((p, i) => (
              <motion.div
                key={p._id}
                className="admin-card overflow-hidden group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <div className="aspect-[4/3] bg-white/[0.03] relative overflow-hidden">
                  {p.image ? (
                    <img src={`${SERVER_URL}${p.image}`} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className={`text-xs px-2 py-1 rounded-lg font-medium backdrop-blur-sm border ${p.visible ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-slate-500/20 text-slate-300 border-slate-500/30"}`}>
                      {p.visible ? "Visible" : "Hidden"}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <p className="font-medium text-white text-sm truncate">{p.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{p.category}</p>
                  <p className="text-xs text-emerald-400/80 mt-1">{p.stockQuantity || 0} in stock</p>
                  <div className="flex gap-2 mt-3">
                    <Link to={`/admin/products/${p._id}/edit`} className="flex-1 text-center px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition-colors">
                      Edit
                    </Link>
                    <button onClick={() => setDeleteId(p._id)} className="px-3 py-1.5 text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="admin-card p-6 max-w-sm w-full shadow-2xl text-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-red-500/10 flex items-center justify-center">
                <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Delete Product?</h3>
              <p className="text-slate-400 text-sm mb-6">This action cannot be undone. The product and its image will be permanently deleted.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="admin-btn-outline flex-1 py-2.5 text-sm">
                  Cancel
                </button>
                <button
                  onClick={() => deleteMutation.mutate(deleteId)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl font-medium text-sm transition-colors disabled:opacity-60"
                >
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
