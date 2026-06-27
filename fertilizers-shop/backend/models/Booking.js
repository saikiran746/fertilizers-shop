const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    productName: { type: String, required: true },
    address: { type: String, required: true },
    location: {
      lat: { type: Number },
      lng: { type: Number }
    },
    status: { type: String, enum: ["pending", "confirmed", "cancelled"], default: "pending" },
    read: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
