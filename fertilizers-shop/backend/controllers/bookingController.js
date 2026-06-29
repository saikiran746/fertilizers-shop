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
    const { name, phone, email, address, location } = req.body;
    let items = req.body.items;

    // Support legacy single-product format
    if (!items && req.body.productId) {
      items = [{ productId: req.body.productId, quantity: req.body.quantity || 1 }];
    }

    if (!name || !phone || !address) {
      return res.status(400).json({ error: "Missing required fields (name, phone, address)" });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Please select at least one product" });
    }

    // Try new multi-item booking schema first
    try {
      const bookingItemsData = [];

      for (const item of items) {
        const { productId, quantity = 1 } = item;
        const product = await prisma.product.findUnique({ where: { id: productId } });

        if (!product) {
          return res.status(404).json({ error: `Product not found: ${productId}` });
        }

        bookingItemsData.push({
          productId,
          productName: product.name,
          quantity
        });

        const hadStock = product.stockQuantity > 0;
        if (hadStock) {
          const newQuantity = Math.max(0, product.stockQuantity - quantity);
          const isOutOfStock = newQuantity <= 0;

          await prisma.product.update({
            where: { id: productId },
            data: {
              stockQuantity: newQuantity,
              inStock: !isOutOfStock,
              visible: isOutOfStock ? false : product.visible,
            }
          });

          if (isOutOfStock) {
            await prisma.message.create({
              data: {
                name: "System Alert",
                email: "system@agroplus.com",
                phone: "N/A",
                message: `The product "${product.name}" is now out of stock and has been automatically hidden from clients.`,
                isRead: false
              }
            });
          }
        }
      }

      const booking = await prisma.booking.create({
        data: {
          name,
          phone,
          email,
          address,
          lat: location?.lat,
          lng: location?.lng,
          items: {
            create: bookingItemsData
          }
        },
        include: { items: true }
      });

      return res.status(201).json(mapBooking(booking));
    } catch (schemaErr) {
      // Fallback: BookingItem table may not exist yet - create booking without items relation
      console.warn("BookingItem schema not ready, using legacy fallback:", schemaErr.message);

      const firstItem = items[0];
      const product = await prisma.product.findUnique({ where: { id: firstItem.productId } }).catch(() => null);

      const booking = await prisma.booking.create({
        data: {
          name,
          phone,
          email,
          address,
          lat: location?.lat,
          lng: location?.lng,
        }
      });

      return res.status(201).json(mapBooking(booking));
    }
  } catch (err) {
    console.error("createBooking error:", err);
    res.status(500).json({ error: "Server error: " + err.message });
  }
};


// ── Get all bookings ─────────────────────────────────────────────────
exports.getBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      include: { items: true }
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
      take: 5,
      include: { items: true }
    });
    res.json(bookings.map(mapBooking));
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// ── Mark booking as read ─────────────────────────────────────────────
exports.markBookingRead = async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({ 
      where: { id: req.params.id },
      include: { items: true }
    });
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    
    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: { read: true },
      include: { items: true }
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
    let booking = await prisma.booking.findUnique({ 
      where: { id: req.params.id },
      include: { items: true }
    });
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    const prevStatus = booking.status;
    booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status },
      include: { items: true }
    });

    // If cancelling, restore stock for all items
    if (status === "cancelled" && prevStatus !== "cancelled") {
      for (const item of booking.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: { increment: item.quantity },
            inStock: true
          }
        });
      }
    }

    // If uncancelling, decrement stock again
    if (prevStatus === "cancelled" && status !== "cancelled") {
      for (const item of booking.items) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        if (product && product.stockQuantity > 0) {
          const newQuantity = Math.max(0, product.stockQuantity - item.quantity);
          await prisma.product.update({
            where: { id: product.id },
            data: {
              stockQuantity: newQuantity,
              inStock: newQuantity > 0
            }
          });
        }
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
    const booking = await prisma.booking.findUnique({ 
      where: { id: req.params.id },
      include: { items: true } 
    });
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    if (booking.status !== "cancelled") {
      for (const item of booking.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: { increment: item.quantity },
            inStock: true
          }
        });
      }
    }

    await prisma.booking.delete({ where: { id: req.params.id } });
    res.json({ message: "Booking deleted and stock restored" });
  } catch (err) {
    console.error("deleteBooking error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
