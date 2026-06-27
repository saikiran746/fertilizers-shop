const Booking = require("../models/Booking");
const Product = require("../models/Product");

// ── Create booking & decrement stock ────────────────────────────────
exports.createBooking = async (req, res) => {
  try {
    const { name, phone, email, productId, address, location } = req.body;

    if (!name || !phone || !productId || !address) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Warn if out of stock but still allow booking (admin can manage)
    const hadStock = product.stockQuantity > 0;

    // Decrement stock by 1 (floor at 0, never go negative)
    if (hadStock) {
      product.stockQuantity = Math.max(0, product.stockQuantity - 1);
      // Auto-mark inStock=false if stock hits 0
      if (product.stockQuantity === 0) {
        product.inStock = false;
      }
      await product.save();
    }

    const booking = await Booking.create({
      name,
      phone,
      email,
      productId,
      productName: product.name,
      address,
      location,
    });

    res.status(201).json(booking);
  } catch (err) {
    console.error("createBooking error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ── Get all bookings ─────────────────────────────────────────────────
exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// ── Get recent 5 bookings (for dashboard) ───────────────────────────
exports.getRecentBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 }).limit(5);
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// ── Mark booking as read ─────────────────────────────────────────────
exports.markBookingRead = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    booking.read = true;
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// ── Update booking status & restore stock if cancelled ───────────────
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    const prevStatus = booking.status;
    booking.status = status;
    await booking.save();

    // Restore stock when admin cancels a previously pending/confirmed booking
    if (status === "cancelled" && prevStatus !== "cancelled") {
      await Product.findByIdAndUpdate(booking.productId, {
        $inc: { stockQuantity: 1 },
        $set: { inStock: true },
      });
    }

    // Re-decrement if admin un-cancels (confirmed/pending) a previously cancelled booking
    if (prevStatus === "cancelled" && status !== "cancelled") {
      const product = await Product.findById(booking.productId);
      if (product && product.stockQuantity > 0) {
        product.stockQuantity = Math.max(0, product.stockQuantity - 1);
        if (product.stockQuantity === 0) product.inStock = false;
        await product.save();
      }
    }

    res.json(booking);
  } catch (err) {
    console.error("updateBookingStatus error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ── Delete booking & restore stock ───────────────────────────────────
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    // Restore stock only if the booking wasn't already cancelled
    if (booking.status !== "cancelled") {
      await Product.findByIdAndUpdate(booking.productId, {
        $inc: { stockQuantity: 1 },
        $set: { inStock: true },
      });
    }

    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: "Booking deleted and stock restored" });
  } catch (err) {
    console.error("deleteBooking error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
