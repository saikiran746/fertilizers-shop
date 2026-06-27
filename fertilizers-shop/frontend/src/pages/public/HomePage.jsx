import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { fetchProducts } from "../../api/products";
import { fetchSiteSettings } from "../../api/settings";
import ProductCard from "../../components/ui/ProductCard";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const CATEGORIES = [
  { name: "Primary Nutrients", icon: "🌿", desc: "NPK essentials for vigorous growth", color: "from-green-50 to-green-100 border-green-200" },
  { name: "Organic Fertilizers", icon: "🌱", desc: "Natural soil enrichment solutions", color: "from-emerald-50 to-emerald-100 border-emerald-200" },
  { name: "Secondary Nutrients", icon: "🪴", desc: "Calcium, Magnesium & Sulphur blends", color: "from-teal-50 to-teal-100 border-teal-200" },
  { name: "Water Soluble Fertilizers", icon: "💧", desc: "Drip & spray compatible formulas", color: "from-blue-50 to-blue-100 border-blue-200" },
  { name: "Micronutrients", icon: "⚗️", desc: "Chelated trace elements for plants", color: "from-purple-50 to-purple-100 border-purple-200" },
  { name: "Bio Fertilizer Products", icon: "🦠", desc: "Beneficial microbial inoculants", color: "from-yellow-50 to-yellow-100 border-yellow-200" },
];

const FEATURES = [
  { icon: "📈", title: "Improves Crop Yield", desc: "Scientifically formulated nutrients that consistently boost harvest output by 20-40%." },
  { icon: "💧", title: "Easy Spray Application", desc: "Convenient ready-mix sprays for uniform, time-saving field application." },
  { icon: "🥦", title: "All-Crop Compatible", desc: "Optimized for vegetables, fruits, cereals, and cash crops." },
  { icon: "🚿", title: "Irrigation Friendly", desc: "Drip and sprinkler irrigation compatible — zero clogging formula." },
  { icon: "⚡", title: "Fast Absorption", desc: "Chelated micronutrients ensure rapid uptake within 24 hours." },
  { icon: "🌍", title: "Eco-Friendly", desc: "Biodegradable formulations that protect long-term soil health." },
];

const TESTIMONIALS = [
  { name: "Ramesh Kumar", crop: "Cotton Farmer, Telangana", text: "Using these fertilizers doubled my cotton yield this season. Highly recommend to every farmer in our village!", stars: 5 },
  { name: "Sunita Devi", crop: "Vegetable Grower, Andhra Pradesh", text: "My tomato and brinjal crops have never looked better. The micronutrient blend made a visible difference in just 2 weeks.", stars: 5 },
  { name: "Vijay Reddy", crop: "Rice Farmer, Karnataka", text: "Excellent product quality and very helpful team. Best investment I made for my paddy fields this Kharif season.", stars: 5 },
];

const STATS = [
  { value: "10,000+", label: "Happy Farmers" },
  { value: "50+", label: "Products" },
  { value: "15+", label: "Years Experience" },
  { value: "20+", label: "States Covered" },
];

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

export default function HomePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["featured-products"],
    queryFn: () => fetchProducts({ limit: 3 }),
  });
  const { data: settings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: fetchSiteSettings,
    staleTime: 60000,
  });
  const phone = settings?.phone || "+91-98765-43210";
  const featured = data?.products || [];

  return (
    <div className="overflow-x-hidden">
      {/* ── Hero ── */}
      <section className="relative min-h-[88vh] flex items-center bg-hero-gradient overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 text-9xl animate-float">🌾</div>
          <div className="absolute bottom-20 right-10 text-9xl animate-float" style={{ animationDelay: "1s" }}>🌿</div>
          <div className="absolute top-40 right-1/4 text-7xl animate-float" style={{ animationDelay: "2s" }}>🌱</div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block bg-white/20 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">
              🏆 India's Trusted Fertilizer Brand
            </span>
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-white leading-tight mb-4">
              Apply Less,<br />
              <span className="text-green-300">Expect More</span>
            </h1>
            <p className="text-green-100 text-lg leading-relaxed mb-8 max-w-lg">
              Premium fertilizers and crop nutrition solutions trusted by thousands of farmers across India. 
              Boost your yield with scientifically proven formulations.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products" className="btn-primary bg-white text-brand-green hover:bg-green-50 shadow-lg">
                🌿 Browse Products
              </Link>
              <a href={`tel:${phone}`} className="btn-outline border-white text-white hover:bg-white hover:text-brand-green">
                📞 Call to Order
              </a>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden md:flex justify-center"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 text-center border border-white/20">
              <div className="text-8xl mb-4 animate-float">🌾</div>
              <p className="text-white font-heading font-bold text-xl">Healthy Crops</p>
              <p className="text-green-200 text-sm">Better Nutrition = Better Harvest</p>
              <div className="mt-6 grid grid-cols-2 gap-4">
                {STATS.map((s) => (
                  <div key={s.label} className="bg-white/10 rounded-xl p-3">
                    <div className="text-white font-bold text-xl">{s.value}</div>
                    <div className="text-green-200 text-xs">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-white" style={{ clipPath: "ellipse(60% 100% at 50% 100%)" }} />
      </section>

      {/* ── Stats Bar ── */}
      <section className="bg-white py-8 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:hidden">
          {STATS.map((s) => (
            <div key={s.label}>
              <div className="text-2xl font-heading font-bold text-brand-green">{s.value}</div>
              <div className="text-gray-500 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div className="text-center mb-12" {...fadeUp}>
            <h2 className="section-title">Our Product Categories</h2>
            <p className="section-subtitle">Complete crop nutrition solutions for every farming need</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link
                  to={`/products?category=${encodeURIComponent(cat.name)}`}
                  className={`group block border rounded-2xl p-6 bg-gradient-to-br ${cat.color} hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
                >
                  <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">{cat.icon}</div>
                  <h3 className="font-heading font-bold text-gray-800 mb-1">{cat.name}</h3>
                  <p className="text-gray-600 text-sm">{cat.desc}</p>
                  <span className="mt-3 inline-flex items-center text-brand-green text-sm font-medium group-hover:gap-2 transition-all">
                    View Products →
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      {(isLoading || featured.length > 0) && (
        <section className="py-20 bg-brand-bg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div className="text-center mb-12" {...fadeUp}>
              <h2 className="section-title">Featured Products</h2>
              <p className="section-subtitle">Our best-selling fertilizers trusted by thousands of farmers</p>
            </motion.div>
            {isLoading ? (
              <LoadingSpinner text="Loading products..." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {featured.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
            )}
            <div className="text-center mt-10">
              <Link to="/products" className="btn-outline">View All Products →</Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Features ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div className="text-center mb-12" {...fadeUp}>
            <h2 className="section-title">Why Choose Our Fertilizers?</h2>
            <p className="section-subtitle">Proven formulations that deliver measurable results in your fields</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                className="p-6 rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{f.icon}</div>
                <h3 className="font-heading font-bold text-gray-800 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 bg-hero-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div className="text-center mb-12" {...fadeUp}>
            <h2 className="section-title text-white">What Farmers Say</h2>
            <p className="section-subtitle text-green-200">Real results from real farmers across India</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
              >
                <div className="text-yellow-400 text-lg mb-3">{"★".repeat(t.stars)}</div>
                <p className="text-green-100 italic mb-4 text-sm leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-400 flex items-center justify-center font-bold text-white">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{t.name}</p>
                    <p className="text-green-300 text-xs">{t.crop}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div {...fadeUp}>
            <h2 className="section-title">Ready to Boost Your Crop Yield?</h2>
            <p className="text-gray-500 mb-8">Call us today to speak with our agricultural experts and place your order.</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a href={`tel:${phone}`} className="btn-primary text-lg py-4 px-8 shadow-xl">
                📞 {phone} — Call to Order
              </a>
              <Link to="/products" className="btn-outline text-lg py-4 px-8">
                Browse Catalogue
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
