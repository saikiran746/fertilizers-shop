const mongoose = require("mongoose");

const CATEGORIES = [
  "Primary Nutrients",
  "Organic Fertilizers",
  "Secondary Nutrients",
  "Water Soluble Fertilizers",
  "Micronutrients",
  "Bio Fertilizer Products",
];

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, maxlength: 1000 },
    category: { type: String, required: true },
    image: { type: String, default: null },
    visible: { type: Boolean, default: true },
    price: { type: Number, default: 0 },
    benefits: { type: String, default: "" },
    inStock: { type: Boolean, default: true },
    stockQuantity: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", description: "text" });

module.exports = mongoose.model("Product", productSchema);
module.exports.CATEGORIES = CATEGORIES;
