import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const COMPANY = import.meta.env.VITE_COMPANY_NAME || "GreenGrow Fertilizers";
const PHONE = import.meta.env.VITE_CONTACT_PHONE || "+91-98765-43210";

const POINTS = [
  { icon: "🏆", title: "15+ Years of Excellence", desc: "Over a decade and a half serving farmers with trusted crop nutrition." },
  { icon: "🔬", title: "Research-Backed Formulas", desc: "All products developed with agronomists and field-tested across major crops." },
  { icon: "🌍", title: "Eco-Responsible", desc: "Committed to sustainable, environmentally safe agricultural inputs." },
  { icon: "🤝", title: "Farmer First", desc: "Every product is designed around the needs and feedback of real farmers." },
];

const PRODUCTS = [
  { name: "Organic Fertilizers", desc: "Compost-based and bio-organic products for natural soil enrichment." },
  { name: "Water Soluble Fertilizers", desc: "Fully soluble NPK grades for drip and sprinkler systems." },
  { name: "Micronutrient Blends", desc: "Chelated Zinc, Boron, Iron, Manganese, Copper formulations." },
  { name: "Bio Stimulants", desc: "Humic acid, fulvic acid, and seaweed extract products." },
  { name: "Primary NPK", desc: "Urea, DAP, SSP, and complex NPK fertilizers." },
  { name: "Secondary Nutrients", desc: "Calcium nitrate, magnesium sulphate, sulphur products." },
];

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-hero-gradient py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-5xl font-heading font-bold text-white mb-3">About Us</h1>
          <p className="text-green-200 text-lg">Empowering Indian farmers since 2009</p>
        </motion.div>
      </div>

      {/* Story */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-14 items-center">
          <motion.div {...fadeUp}>
            <h2 className="text-3xl font-heading font-bold text-gray-800 mb-5">Our Story</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              {COMPANY} was founded with a single mission: to help every Indian farmer access world-class crop nutrition at accessible prices. 
              Starting from a small warehouse in Hyderabad, we have grown to serve farmers across 20+ states.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              Our team of experienced agronomists and chemists continuously develops new formulations tailored to the unique soil conditions 
              and cropping patterns of Indian agriculture.
            </p>
            <p className="text-gray-600 leading-relaxed">
              We believe in the principle of <strong className="text-brand-green">"Apply Less, Expect More"</strong> — maximizing efficiency 
              so farmers spend less on inputs and earn more from their harvests.
            </p>
          </motion.div>
          <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
            <div className="grid grid-cols-2 gap-4">
              {POINTS.map((p) => (
                <div key={p.title} className="bg-brand-bg rounded-2xl p-5 border border-primary-100">
                  <div className="text-3xl mb-2">{p.icon}</div>
                  <h4 className="font-bold text-gray-800 text-sm mb-1">{p.title}</h4>
                  <p className="text-gray-500 text-xs">{p.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Product Range */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div className="text-center mb-12" {...fadeUp}>
            <h2 className="section-title">Our Product Range</h2>
            <p className="section-subtitle">A complete portfolio of agricultural nutrition solutions</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PRODUCTS.map((p, i) => (
              <motion.div
                key={p.name}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-all"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <h4 className="font-bold text-brand-green mb-2">{p.name}</h4>
                <p className="text-gray-500 text-sm">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-hero-gradient text-center">
        <motion.div {...fadeUp}>
          <h2 className="text-3xl font-heading font-bold text-white mb-4">Partner With Us</h2>
          <p className="text-green-200 mb-8">Join thousands of farmers who trust {COMPANY} for their crop nutrition needs.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href={`tel:${PHONE}`} className="btn-primary bg-white text-brand-green hover:bg-green-50">📞 {PHONE}</a>
            <Link to="/products" className="btn-outline border-white text-white hover:bg-white hover:text-brand-green">Browse Products</Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
