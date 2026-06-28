import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { adminFetchProducts, adminCreateProduct, adminUpdateProduct } from "../../api/products";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const CATEGORIES = [
  "Primary Nutrients",
  "Organic Fertilizers",
  "Secondary Nutrients",
  "Water Soluble Fertilizers",
  "Micronutrients",
  "Bio Fertilizer Products",
];

export default function AdminProductFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [form, setForm] = useState({ name: "", description: "", category: CATEGORIES[0], visible: true, price: 0, benefits: "", inStock: true, stockQuantity: 0 });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const { data: products, isLoading: prodLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: adminFetchProducts,
    enabled: isEdit,
  });

  useEffect(() => {
    if (isEdit && products) {
      const product = products.find((p) => p._id === id);
      if (product) {
        setForm({ name: product.name, description: product.description, category: product.category, visible: product.visible, price: product.price || 0, benefits: product.benefits || "", inStock: product.inStock !== undefined ? product.inStock : true, stockQuantity: product.stockQuantity || 0 });
        if (product.image) setImagePreview(`${SERVER_URL}${product.image}`);
      }
    }
  }, [isEdit, products, id]);

  const onDrop = useCallback((accepted) => {
    const file = accepted[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [], "image/png": [], "image/webp": [] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  const mutation = useMutation({
    mutationFn: (fd) => (isEdit ? adminUpdateProduct(id, fd) : adminCreateProduct(fd)),
    onSuccess: () => {
      toast.success(isEdit ? "Product updated!" : "Product added!");
      qc.invalidateQueries(["admin-products"]);
      qc.invalidateQueries(["admin-enhanced-stats"]);
      navigate("/admin/products");
    },
    onError: (err) => toast.error(err.response?.data?.error || "Something went wrong"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Product name is required");
    if (!form.description.trim()) return toast.error("Description is required");
    if (!isEdit && !imageFile) return toast.error("Please upload a product image");

    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("description", form.description);
    fd.append("category", form.category);
    fd.append("visible", form.visible);
    fd.append("price", form.price);
    fd.append("benefits", form.benefits);
    fd.append("inStock", form.inStock);
    fd.append("stockQuantity", form.stockQuantity);
    if (imageFile) fd.append("image", imageFile);
    mutation.mutate(fd);
  };

  if (isEdit && prodLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link to="/admin/products" className="text-slate-500 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/[0.05]">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </Link>
        <div>
          <h2 className="text-3xl font-heading font-extrabold text-white tracking-tight">{isEdit ? "Edit Product" : "Add New Product"}</h2>
          <p className="text-slate-400 text-sm">{isEdit ? "Update product details" : "Fill in the details for the new product"}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Image Upload */}
        <motion.div className="admin-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <label className="admin-label">
            Product Image {!isEdit && <span className="text-red-400">*</span>}
          </label>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              isDragActive
                ? "border-emerald-500 bg-emerald-500/5"
                : "border-white/[0.08] hover:border-emerald-500/40 hover:bg-white/[0.02]"
            }`}
          >
            <input {...getInputProps()} />
            {imagePreview ? (
              <div className="space-y-3">
                <img src={imagePreview} alt="Preview" className="h-44 mx-auto rounded-xl object-cover" />
                <p className="text-sm text-slate-500">Click or drag to replace image</p>
              </div>
            ) : (
              <>
                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-white/[0.04] flex items-center justify-center">
                  <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <p className="text-slate-300 font-medium">{isDragActive ? "Drop image here" : "Drag & drop or click to upload"}</p>
                <p className="text-xs text-slate-600 mt-1">JPEG, PNG, WebP — up to 5MB</p>
              </>
            )}
          </div>
        </motion.div>

        {/* Name */}
        <motion.div className="admin-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <label className="admin-label">Product Name <span className="text-red-400">*</span></label>
          <input
            id="admin-product-name"
            className="admin-input"
            type="text"
            placeholder="e.g. NPK 19-19-19 Complex Fertilizer"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            maxLength={120}
            required
          />
          <p className="text-xs text-slate-600 mt-1.5">{form.name.length}/120</p>
        </motion.div>

        {/* Category */}
        <motion.div className="admin-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          <label className="admin-label">Category <span className="text-red-400">*</span></label>
          <select
            id="admin-product-category"
            className="admin-input"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            required
            style={{ colorScheme: "dark" }}
          >
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </motion.div>

        {/* Price */}
        <motion.div className="admin-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13 }}>
          <label className="admin-label">Price (₹)</label>
          <input
            id="admin-product-price"
            className="admin-input"
            type="number"
            min="0"
            placeholder="e.g. 500"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
        </motion.div>

        {/* Benefits */}
        <motion.div className="admin-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
          <label className="admin-label">Key Benefits</label>
          <input
            id="admin-product-benefits"
            className="admin-input"
            type="text"
            placeholder="e.g. Improves root growth, Increases yield"
            value={form.benefits}
            onChange={(e) => setForm({ ...form, benefits: e.target.value })}
          />
        </motion.div>

        {/* Description */}
        <motion.div className="admin-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
          <label className="admin-label">Description <span className="text-red-400">*</span></label>
          <textarea
            id="admin-product-description"
            className="admin-input resize-none"
            rows={5}
            placeholder="Describe the product, its benefits, usage instructions, and crop suitability..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            maxLength={1000}
            required
          />
          <p className="text-xs text-slate-600 mt-1.5">{form.description.length}/1000</p>
        </motion.div>

        {/* Visibility */}
        <motion.div
          className="admin-card p-5 flex items-center justify-between gap-4"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        >
          <div className="flex-1 min-w-0">
            <p className="font-medium text-white">Product Visibility</p>
            <p className="text-sm text-slate-400 mt-0.5">
              {form.visible ? "Visible to customers on the website" : "Hidden from public catalog"}
            </p>
          </div>
          {/* Toggle switch — pill w-12 h-6, thumb w-5 h-5 */}
          <button
            type="button"
            onClick={() => setForm({ ...form, visible: !form.visible })}
            role="switch"
            aria-checked={form.visible}
            className={`relative inline-flex items-center w-12 h-6 rounded-full flex-shrink-0 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              form.visible ? "bg-emerald-500" : "bg-slate-600"
            }`}
          >
            <span
              className={`inline-block w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                form.visible ? "translate-x-6" : "translate-x-0.5"
              }`}
            />
          </button>
        </motion.div>

        {/* Stock Status */}
        <motion.div
          className="admin-card p-5 flex items-center justify-between gap-4"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
        >
          <div className="flex-1 min-w-0">
            <p className="font-medium text-white">Stock Availability</p>
            <p className="text-sm text-slate-400 mt-0.5">
              {form.inStock ? "In Stock - Available for purchase" : "Out of Stock"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setForm({ ...form, inStock: !form.inStock })}
            role="switch"
            aria-checked={form.inStock}
            className={`relative inline-flex items-center w-12 h-6 rounded-full flex-shrink-0 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              form.inStock ? "bg-emerald-500" : "bg-slate-600"
            }`}
          >
            <span
              className={`inline-block w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                form.inStock ? "translate-x-6" : "translate-x-0.5"
              }`}
            />
          </button>
        </motion.div>

        {/* Stock Quantity */}
        <motion.div className="admin-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.23 }}>
          <label className="admin-label">Stock Quantity</label>
          <input
            id="admin-product-stock"
            className="admin-input"
            type="number"
            min="0"
            placeholder="e.g. 100"
            value={form.stockQuantity}
            onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
          />
        </motion.div>


        {/* Actions */}
        <div className="flex gap-4 pt-2">
          <Link to="/admin/products" className="admin-btn-outline flex-1 text-center py-3">
            Cancel
          </Link>
          <button
            id="admin-product-submit"
            type="submit"
            disabled={mutation.isPending}
            className="admin-btn flex-1 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mutation.isPending ? "Saving..." : isEdit ? "Update Product" : "Add Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
