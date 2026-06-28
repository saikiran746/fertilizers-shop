const prisma = require("../prismaClient");
const mapMongoId = require("../utils/mongoMapper");

function mapBooking(b) {
  if (!b) return b;
  const mapped = mapMongoId(b);
  if (mapped.lat !== undefined && mapped.lng !== undefined) {
    mapped.location = { lat: mapped.lat, lng: mapped.lng };
    delete mapped.lat;
    delete mapped.lng;
  }
  return mapped;
}

// ── Create booking & decrement stock ────────────────────────────────
exports.createBooking = async (req, res) => {
  try {
    const { name, phone, email, productId, address, location } = req.body;

    if (!name || !phone || !productId || !address) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const hadStock = product.stockQuantity > 0;
    if (hadStock) {
      const newQuantity = Math.max(0, product.stockQuantity - 1);
      await prisma.product.update({
        where: { id: productId },
        data: {
          stockQuantity: newQuantity,
          inStock: newQuantity > 0,
        }
      });
    }

    const booking = await prisma.booking.create({
      data: {
        name,
        phone,
        email,
        productId,
        productName: product.name,
        address,
        lat: location?.lat,
        lng: location?.lng,
      }
    });

    res.status(201).json(mapBooking(booking));
  } catch (err) {
    console.error("createBooking error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ── Get all bookings ─────────────────────────────────────────────────
exports.getBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: "desc" }
    });
    res.json(bookings.map(mapBooking));
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// ── Get recent 5 bookings (for dashboard) ───────────────────────────
exports.getRecentBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 5
    });
    res.json(bookings.map(mapBooking));
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// ── Mark booking as read ─────────────────────────────────────────────
exports.markBookingRead = async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    
    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: { read: true }
    });
    res.json(mapBooking(updated));
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// ── Update booking status & restore stock if cancelled ───────────────
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    let booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    const prevStatus = booking.status;
    booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status }
    });

    if (status === "cancelled" && prevStatus !== "cancelled") {
      await prisma.product.update({
        where: { id: booking.productId },
        data: {
          stockQuantity: { increment: 1 },
          inStock: true
        }
      });
    }

    if (prevStatus === "cancelled" && status !== "cancelled") {
      const product = await prisma.product.findUnique({ where: { id: booking.productId } });
      if (product && product.stockQuantity > 0) {
        const newQuantity = Math.max(0, product.stockQuantity - 1);
        await prisma.product.update({
          where: { id: product.id },
          data: {
            stockQuantity: newQuantity,
            inStock: newQuantity > 0
          }
        });
      }
    }

    res.json(mapBooking(booking));
  } catch (err) {
    console.error("updateBookingStatus error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ── Delete booking & restore stock ───────────────────────────────────
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    if (booking.status !== "cancelled") {
      await prisma.product.update({
        where: { id: booking.productId },
        data: {
          stockQuantity: { increment: 1 },
          inStock: true
        }
      });
    }

    await prisma.booking.delete({ where: { id: req.params.id } });
    res.json({ message: "Booking deleted and stock restored" });
  } catch (err) {
    console.error("deleteBooking error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
