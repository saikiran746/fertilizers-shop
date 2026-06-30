/**
 * seedProducts.js – Seeds all 10 fertilizer categories and 30 products.
 * Run: node scripts/seedProducts.js
 * Idempotent: clears existing products and re-inserts.
 */

require("dotenv").config();
const prisma = require("../prismaClient");

// ── Product Data ─────────────────────────────────────────────────────────────
const products = [
  // ─── UREA FERTILIZERS ────────────────────────────────────────────────────
  {
    name: "Urea 46% Nitrogen – 45kg Bag",
    category: "Urea Fertilizers",
    price: 1250,
    stockQuantity: 500,
    inStock: true,
    visible: true,
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&q=80",
    description:
      "High-quality granular urea fertilizer with 46% nitrogen content. Ideal for all field crops, vegetables, and plantation crops. Fast-acting nitrogen source that promotes vigorous vegetative growth and deep green foliage.",
    benefits:
      "• Highest nitrogen content (46%) among solid nitrogenous fertilizers\n• Promotes rapid vegetative growth and lush green colour\n• Suitable for all soil types and all major crops\n• Water-soluble – can be applied as foliar spray or soil drench\n• Cost-effective nitrogen source for Indian farmers",
    usageInstructions:
      "Basal dose: 30–50 kg per acre before sowing. Top dressing: 15–25 kg per acre 30 days after sowing. Mix with soil before irrigation to prevent nitrogen volatilisation. Avoid application on waterlogged fields.",
  },
  {
    name: "Premium Agricultural Urea – 50kg Bag",
    category: "Urea Fertilizers",
    price: 1400,
    stockQuantity: 320,
    inStock: true,
    visible: true,
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80",
    description:
      "Premium neem-coated urea with controlled nitrogen release. The neem coating inhibits nitrification, reducing nitrogen loss and improving fertilizer use efficiency. Approved by the Government of India under NBS scheme.",
    benefits:
      "• Neem-coated for slow-release nitrogen supply\n• Reduces nitrogen leaching by up to 25%\n• Improves soil microbial activity\n• Enhances crop yield compared to plain urea\n• Environmentally friendly formulation",
    usageInstructions:
      "Apply 40–60 kg per acre as basal dose. Top dressing: 20–30 kg per acre. For paddy: split into 3 equal doses at transplanting, tillering and panicle initiation stages.",
  },

  // ─── DAP FERTILIZERS ─────────────────────────────────────────────────────
  {
    name: "DAP (Diammonium Phosphate) – 50kg Bag",
    category: "DAP Fertilizers",
    price: 1650,
    stockQuantity: 280,
    inStock: true,
    visible: true,
    image: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&q=80",
    description:
      "Standard DAP fertilizer (18:46:0) widely used across India. Provides both nitrogen and phosphorus in one granular application. Essential for root development and energy transfer in crops. Suitable for kharif and rabi seasons.",
    benefits:
      "• Contains 18% Nitrogen + 46% Phosphate (P₂O₅)\n• Improves root development and plant establishment\n• Enhances flowering and fruit setting\n• Boosts crop tolerance to drought and disease\n• Recommended by ICAR for wheat, rice, maize, and pulses",
    usageInstructions:
      "Apply 50 kg per acre as basal dose mixed into top 15 cm of soil before sowing. For transplanted crops, apply in furrows near root zone. Avoid mixing with alkaline materials like lime.",
  },
  {
    name: "High Phosphorus DAP Fertilizer",
    category: "DAP Fertilizers",
    price: 1800,
    stockQuantity: 150,
    inStock: true,
    visible: true,
    image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&q=80",
    description:
      "Enriched DAP formulation with zinc-fortified granules for phosphorus and micronutrient co-application. Particularly effective for deficient soils in Maharashtra, Andhra Pradesh, and Telangana. Reduces need for separate zinc sulphate application.",
    benefits:
      "• High phosphorus content with added zinc (0.5%)\n• Corrects dual deficiency in a single application\n• Improves seed germination and seedling vigour\n• Suitable for alkaline and calcareous soils\n• Reduces overall input costs",
    usageInstructions:
      "Apply 40–50 kg per acre as basal dose. For vegetable crops apply 25–30 kg per acre in furrows. Can be band-placed for better phosphorus efficiency.",
  },

  // ─── NPK FERTILIZERS ─────────────────────────────────────────────────────
  {
    name: "NPK 19:19:19 Water Soluble Fertilizer",
    category: "NPK Fertilizers",
    price: 1950,
    stockQuantity: 200,
    inStock: true,
    visible: true,
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&q=80",
    description:
      "Fully water-soluble balanced NPK complex fertilizer ideal for drip irrigation and foliar spraying. Equal ratio of N, P, and K ensures balanced nutrition for all crop growth stages. Widely used in horticulture and cash crops.",
    benefits:
      "• 100% water-soluble – ideal for fertigation\n• Balanced N:P:K ratio for all growth stages\n• Rapid nutrient absorption through leaves and roots\n• No residue clogging in drip emitters\n• Improves fruit quality, size, and shelf life",
    usageInstructions:
      "Fertigation: dissolve 3–5 kg per 200 litres water per acre per application. Foliar spray: 2–3 g per litre water. Apply weekly during vegetative and flowering stages.",
  },
  {
    name: "NPK 20:20:0+13S Fertilizer",
    category: "NPK Fertilizers",
    price: 1700,
    stockQuantity: 175,
    inStock: true,
    visible: true,
    image: "https://images.unsplash.com/photo-1566650985596-48800b8aaa41?w=600&q=80",
    description:
      "Sulphur-enriched NPK complex fertilizer with equal nitrogen and phosphorus and 13% sulphur. Particularly effective for oilseed crops like groundnut, mustard, and sunflower. Sulphur improves oil content and protein quality.",
    benefits:
      "• High sulphur content boosts oil quality in oilseeds\n• Improves nitrogen use efficiency\n• Corrects sulphur deficiency in light sandy soils\n• Enhances amino acid synthesis in crops\n• Recommended for mustard, groundnut, onion, garlic",
    usageInstructions:
      "Apply 40–50 kg per acre as basal dose. For groundnut: apply 50 kg at sowing. For wheat: 40 kg basal + 20 kg urea top dressing.",
  },
  {
    name: "NPK 10:26:26 Fertilizer",
    category: "NPK Fertilizers",
    price: 1850,
    stockQuantity: 140,
    inStock: true,
    visible: true,
    image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&q=80",
    description:
      "High phosphorus and potassium NPK fertilizer for reproductive stage nutrition. Ideal for use during flowering, fruiting, and grain-filling stages of all crops. Promotes early maturity and better grain weight.",
    benefits:
      "• Low N: high P and K ratio ideal for flowering stage\n• Enhances fruit set, grain weight, and quality\n• Improves drought and stress tolerance\n• Reduces premature fruit drop\n• Suitable for cotton, soybean, sugarcane, vegetables",
    usageInstructions:
      "Apply 25–30 kg per acre during flowering stage as top dressing. For drip crops: dissolve 3–4 kg per 200 L water per acre. Combine with calcium nitrate for better results in vegetables.",
  },
  {
    name: "NPK 12:32:16 Fertilizer",
    category: "NPK Fertilizers",
    price: 1750,
    stockQuantity: 190,
    inStock: true,
    visible: true,
    image: "https://images.unsplash.com/photo-1592419044706-39796d40f98c?w=600&q=80",
    description:
      "Complex NP-dominant fertilizer for crops requiring high phosphorus at establishment. Ideal as starter fertilizer for transplanted vegetables, sugarcane, and fruit crops. Provides rapid establishment and early crop vigour.",
    benefits:
      "• High phosphorus promotes deep root system\n• Good potassium level for stem strength\n• Ideal starter fertilizer for transplanting\n• Works well in drip and sprinkler systems\n• Enhances nutrient uptake efficiency",
    usageInstructions:
      "Apply 40–50 kg per acre as basal dose. For transplanted vegetables: apply 15–20 kg per acre near root zone at transplanting. For sugarcane: apply 60 kg per acre in furrows at planting.",
  },

  // ─── POTASH FERTILIZERS ──────────────────────────────────────────────────
  {
    name: "MOP (Muriate of Potash) – 50kg Bag",
    category: "Potash Fertilizers",
    price: 1500,
    stockQuantity: 260,
    inStock: true,
    visible: true,
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80",
    description:
      "Standard Muriate of Potash (0:0:60) fertilizer providing 60% potassium content. The most economical potassium source for Indian agriculture. Improves crop quality, shelf life, disease resistance, and water use efficiency.",
    benefits:
      "• Highest potassium content (60% K₂O) among common fertilizers\n• Improves fruit quality, colour, and taste\n• Strengthens cell walls and plant structure\n• Enhances disease and drought resistance\n• Most cost-effective potassium source",
    usageInstructions:
      "Apply 25–30 kg per acre as basal dose. Top dressing: 15–20 kg per acre at 45 days after sowing. Avoid applying in chloride-sensitive crops like tobacco and potato – use SOP instead.",
  },
  {
    name: "SOP (Sulphate of Potash)",
    category: "Potash Fertilizers",
    price: 2100,
    stockQuantity: 120,
    inStock: true,
    visible: true,
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&q=80",
    description:
      "Premium Sulphate of Potash (0:0:50 + 17%S) – chloride-free potassium fertilizer ideal for chloride-sensitive crops. Simultaneously provides potassium and sulphur nutrition. Widely used in potato, tobacco, grapes, and high-value vegetables.",
    benefits:
      "• Chloride-free – safe for sensitive crops\n• Provides both potassium and sulphur\n• Improves tuber and bulb quality in potato and onion\n• Enhances fruit colour, sweetness, and aroma\n• Water-soluble – suitable for drip fertigation",
    usageInstructions:
      "Apply 20–25 kg per acre as basal dose. For fertigation: dissolve 2–3 kg per 200 L water per acre. For potato: apply 30 kg per acre in two splits – at planting and earthing-up stages.",
  },

  // ─── ORGANIC FERTILIZERS ─────────────────────────────────────────────────
  {
    name: "Vermicompost Organic Fertilizer",
    category: "Organic Fertilizers",
    price: 450,
    stockQuantity: 600,
    inStock: true,
    visible: true,
    image: "https://images.unsplash.com/photo-1584824486509-112e4181ff6b?w=600&q=80",
    description:
      "High-quality vermicompost produced from earthworm-processed organic waste. Rich in humic acids, beneficial microorganisms, and plant-available nutrients. Improves soil structure, water retention, and long-term fertility. NPOP certified organic.",
    benefits:
      "• Rich in beneficial microorganisms and enzymes\n• Improves soil texture, aeration, and water retention\n• Slow-release of nutrients over 3–4 months\n• Increases soil organic carbon content\n• Safe for all crops including organic farming",
    usageInstructions:
      "Apply 500 kg to 1 tonne per acre mixed into soil before sowing. For pot culture: mix 20–30% vermicompost with soil. For top dressing: apply 250–300 kg per acre and water in.",
  },
  {
    name: "Neem Cake Organic Fertilizer",
    category: "Organic Fertilizers",
    price: 380,
    stockQuantity: 450,
    inStock: true,
    visible: true,
    image: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=600&q=80",
    description:
      "Neem cake – the residue after neem oil extraction. Contains azadirachtin which acts as a natural nitrification inhibitor and nematicide. Provides nitrogen (5%), phosphorus (1%), and potassium (1.5%) along with pest-control properties.",
    benefits:
      "• Natural nematicide – controls soil nematodes\n• Inhibits nitrification – reduces nitrogen loss\n• Improves soil microbial activity\n• Pest-repellent properties\n• Approved for organic farming",
    usageInstructions:
      "Apply 200–400 kg per acre mixed into soil 10 days before sowing. For nursery beds: apply 100–150 g per sq metre. For horticultural crops: apply annually at start of season.",
  },
  {
    name: "Cow Manure Organic Mix",
    category: "Organic Fertilizers",
    price: 320,
    stockQuantity: 800,
    inStock: true,
    visible: true,
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80",
    description:
      "Well-composted and processed farmyard manure (FYM) enriched with beneficial microorganisms. Contains balanced NPK plus secondary nutrients. Ideal soil amendment for all types of soil. Improves water holding capacity and CEC.",
    benefits:
      "• Rich in beneficial soil microorganisms\n• Improves soil water-holding capacity\n• Provides balanced macro and micronutrients\n• Enhances soil CEC (cation exchange capacity)\n• Long-lasting soil conditioning effect",
    usageInstructions:
      "Apply 2–4 tonnes per acre as basal dose 3–4 weeks before sowing. Mix thoroughly into top 20 cm soil. For vegetable crops apply 5–8 tonnes per acre for best results.",
  },
  {
    name: "Organic Plant Nutrition Mix",
    category: "Organic Fertilizers",
    price: 620,
    stockQuantity: 300,
    inStock: true,
    visible: true,
    image: "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=600&q=80",
    description:
      "Certified organic NPK blend combining vermicompost, neem cake, bone meal, and rock phosphate. Provides complete nutrition for organic farming systems. NPOP and PGS-India certified. Suitable for export-quality produce production.",
    benefits:
      "• Complete organic nutrition in one product\n• NPOP certified – suitable for organic certification\n• Slow and steady nutrient release\n• Improves soil health over multiple seasons\n• Enhances produce quality and shelf life",
    usageInstructions:
      "Apply 250–500 kg per acre as basal dose. Top dressing: 100–150 kg per acre at 30 days after sowing. For high-value vegetables: apply 600–800 kg per acre for best results.",
  },

  // ─── MICRONUTRIENTS ──────────────────────────────────────────────────────
  {
    name: "Zinc Sulphate 21%",
    category: "Micronutrients",
    price: 750,
    stockQuantity: 350,
    inStock: true,
    visible: true,
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&q=80",
    description:
      "Crystalline zinc sulphate monohydrate with 21% zinc content. Corrects zinc deficiency (khaira disease) in paddy and other crops. Recommended by state agriculture departments for widespread zinc-deficient soils across India.",
    benefits:
      "• Corrects zinc deficiency in rice (khaira disease)\n• Improves grain quality and protein content\n• Enhances enzyme activity and photosynthesis\n• Effective in alkaline and calcareous soils\n• Water-soluble – can be used as foliar spray",
    usageInstructions:
      "Soil application: 10 kg per acre. Foliar spray: dissolve 2.5 g per litre water and spray on leaves. For paddy: apply 10 kg per acre 3 weeks after transplanting. Repeat every 3 years for preventive treatment.",
  },
  {
    name: "Ferrous Sulphate",
    category: "Micronutrients",
    price: 680,
    stockQuantity: 200,
    inStock: true,
    visible: true,
    image: "https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=600&q=80",
    description:
      "Ferrous sulphate (FeSO₄) with 19% iron content for correction of iron chlorosis (yellowing) in crops grown on calcareous and alkaline soils. Essential for chlorophyll synthesis and enzyme function in plants.",
    benefits:
      "• Corrects iron deficiency chlorosis\n• Restores green colour to yellowing leaves\n• Essential for chlorophyll and enzyme synthesis\n• Improves photosynthesis efficiency\n• Effective for groundnut, soybean, and sorghum",
    usageInstructions:
      "Soil application: 25 kg per acre mixed with organic matter. Foliar spray: 0.5% solution (5 g per litre) on young leaves. Repeat spray after 10–14 days if deficiency persists.",
  },
  {
    name: "Magnesium Sulphate",
    category: "Micronutrients",
    price: 580,
    stockQuantity: 280,
    inStock: true,
    visible: true,
    image: "https://images.unsplash.com/photo-1603871165848-0aa92c869fa1?w=600&q=80",
    description:
      "Magnesium sulphate (Epsom salt) with 9.8% Mg and 13% sulphur for correcting magnesium and sulphur deficiencies. Essential for chlorophyll formation and enzyme activation. Widely used in coconut, banana, and plantation crops.",
    benefits:
      "• Corrects magnesium deficiency (interveinal chlorosis)\n• Essential component of chlorophyll molecule\n• Improves photosynthesis and sugar transport\n• Provides additional sulphur nutrition\n• Water-soluble – ideal for foliar application",
    usageInstructions:
      "Soil application: 20 kg per acre. Foliar spray: 2% solution (20 g per litre water). For coconut: 500 g per tree per year mixed with soil. For banana: 50 g per plant per application.",
  },
  {
    name: "Boron Micronutrient Mix",
    category: "Micronutrients",
    price: 850,
    stockQuantity: 180,
    inStock: true,
    visible: true,
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80",
    description:
      "Granular boron fertilizer with 20% boron content for correction of boron deficiency. Critical micronutrient for pollination, cell wall development, and sugar transport. Prevents hollow heart in cauliflower, stem crack in celery, and poor fruit set.",
    benefits:
      "• Improves pollination and fruit set\n• Prevents hollow heart disorder in vegetables\n• Enhances cell wall formation\n• Increases sugar transport and yield\n• Essential for oilseed and cotton crops",
    usageInstructions:
      "Soil application: 1–2 kg per acre mixed with sand. Foliar spray: 0.1–0.2% solution (1–2 g per litre) at flowering stage. Do not over-apply – boron toxicity can occur at high doses.",
  },

  // ─── BIO FERTILIZERS ─────────────────────────────────────────────────────
  {
    name: "Azospirillum Bio Fertilizer",
    category: "Bio Fertilizers",
    price: 280,
    stockQuantity: 400,
    inStock: true,
    visible: true,
    image: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=600&q=80",
    description:
      "Liquid bio fertilizer containing Azospirillum brasilense – nitrogen-fixing bacteria that colonise plant roots and fix atmospheric nitrogen. Reduces chemical nitrogen requirement by 20–25%. Suitable for wheat, maize, sorghum, cotton, and vegetables.",
    benefits:
      "• Fixes atmospheric nitrogen (20–30 kg N per acre)\n• Reduces chemical nitrogen fertilizer requirement\n• Produces plant growth hormones (IAA, GA)\n• Improves root development and nutrient uptake\n• Eco-friendly – improves soil health over time",
    usageInstructions:
      "Seed treatment: mix 200–250 mL per 10 kg seeds and shade-dry before sowing. Soil application: mix 1 litre with 20 kg compost per acre. Apply within 24 hours of mixing. Avoid use with chemical fungicides.",
  },
  {
    name: "Rhizobium Bio Fertilizer",
    category: "Bio Fertilizers",
    price: 260,
    stockQuantity: 380,
    inStock: true,
    visible: true,
    image: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600&q=80",
    description:
      "Liquid Rhizobium culture for symbiotic nitrogen fixation in legume crops. Rhizobium forms nodules in legume roots and fixes atmospheric nitrogen (50–200 kg N per hectare). Specifically formulated for soybean, groundnut, black gram, and green gram.",
    benefits:
      "• Fixes 50–200 kg nitrogen per hectare in legumes\n• Reduces 50–80% of chemical nitrogen requirement\n• Improves soil nitrogen content for subsequent crops\n• Crop-specific strains for maximum effectiveness\n• Increases yield by 10–35% in field trials",
    usageInstructions:
      "Seed treatment: mix 250 mL per 10 kg seeds just before sowing. Do not expose treated seeds to direct sunlight. Soil application: mix 1 litre with 20 kg compost per acre. Must be used within the expiry date.",
  },
  {
    name: "Phosphate Solubilizing Bacteria (PSB)",
    category: "Bio Fertilizers",
    price: 290,
    stockQuantity: 360,
    inStock: true,
    visible: true,
    image: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=600&q=80",
    description:
      "Liquid PSB culture containing Bacillus megaterium that solubilizes insoluble phosphorus in soil, making it available to plants. Reduces chemical phosphatic fertilizer need by 25%. Works synergistically with Azospirillum and Rhizobium.",
    benefits:
      "• Solubilizes fixed soil phosphorus (up to 25% reduction in DAP use)\n• Improves phosphorus availability in acidic and alkaline soils\n• Produces organic acids that dissolve insoluble phosphates\n• Improves root system development\n• Compatible with Azospirillum and Rhizobium consortia",
    usageInstructions:
      "Seed treatment: 250 mL per 10 kg seeds. Soil drench: 1 litre per acre mixed with compost. Apply at sowing or transplanting stage. Combine with Azospirillum for best results. Avoid mixing with chemical pesticides.",
  },

  // ─── SOIL CONDITIONERS ───────────────────────────────────────────────────
  {
    name: "Humic Acid Soil Conditioner",
    category: "Soil Conditioners",
    price: 920,
    stockQuantity: 220,
    inStock: true,
    visible: true,
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80",
    description:
      "Concentrated humic acid (85% minimum) derived from leonardite for comprehensive soil improvement. Increases CEC, improves soil structure, chelates micronutrients, and stimulates microbial activity. Compatible with all fertilizers and irrigation systems.",
    benefits:
      "• Increases soil cation exchange capacity (CEC)\n• Improves soil structure and aggregate stability\n• Chelates micronutrients for better plant uptake\n• Stimulates beneficial soil microbial activity\n• Reduces soil compaction and improves water infiltration",
    usageInstructions:
      "Soil application: 2–3 kg per acre dissolved in water. Foliar spray: 1–2 g per litre. For drip: 2 kg per acre per application. Apply monthly throughout the crop season for best results.",
  },
  {
    name: "Fulvic Acid Conditioner",
    category: "Soil Conditioners",
    price: 1100,
    stockQuantity: 160,
    inStock: true,
    visible: true,
    image: "https://images.unsplash.com/photo-1550159930-40066082a4fc?w=600&q=80",
    description:
      "High-purity fulvic acid (70% minimum) for rapid plant stimulation and nutrient mobility. Smaller molecular size than humic acid allows direct cellular penetration. Enhances nutrient absorption, improves photosynthesis, and strengthens plant immunity.",
    benefits:
      "• Small molecule size – direct cell penetration\n• Rapidly improves nutrient transport in plants\n• Enhances photosynthesis and energy production\n• Improves drought and stress tolerance\n• Highly compatible with foliar sprays",
    usageInstructions:
      "Foliar spray: 1–2 g per litre water. Soil drench: 1 kg per acre. Best applied in the morning or evening. Combine with micronutrients for synergistic effect. Apply every 15 days during crop season.",
  },
  {
    name: "Soil Health Enhancer Mix",
    category: "Soil Conditioners",
    price: 780,
    stockQuantity: 250,
    inStock: true,
    visible: true,
    image: "https://images.unsplash.com/photo-1446071103084-c257b5050892?w=600&q=80",
    description:
      "Proprietary blend of gypsum, organic matter, and beneficial microorganisms for comprehensive soil health restoration. Corrects soil compaction, improves drainage, balances soil pH, and introduces beneficial microbes. Ideal for degraded agricultural soils.",
    benefits:
      "• Corrects soil compaction and improves permeability\n• Balances soil pH in acidic and alkaline soils\n• Provides calcium and sulphur nutrition\n• Introduces beneficial soil microorganisms\n• Long-lasting improvement lasting 2–3 seasons",
    usageInstructions:
      "Apply 100–150 kg per acre mixed into top 15 cm soil before sowing. For severely degraded soils: apply 200 kg per acre along with 2 tonnes FYM. Repeat application annually for 3 years for best results.",
  },

  // ─── PLANT GROWTH PROMOTERS ──────────────────────────────────────────────
  {
    name: "Seaweed Extract",
    category: "Plant Growth Promoters",
    price: 1350,
    stockQuantity: 180,
    inStock: true,
    visible: true,
    image: "https://images.unsplash.com/photo-1473186578172-c141e6798cf4?w=600&q=80",
    description:
      "Concentrated seaweed extract (Ascophyllum nodosum) containing natural cytokinins, auxins, gibberellins, betaines, and alginic acid. Improves crop quality, stress tolerance, and yield. Widely used in high-value horticulture and export crops.",
    benefits:
      "• Natural plant hormones (cytokinins, auxins, gibberellins)\n• Improves stress tolerance to drought, heat, and cold\n• Enhances fruit quality, colour, and Brix content\n• Improves post-harvest shelf life\n• Stimulates root growth and nutrient uptake",
    usageInstructions:
      "Foliar spray: 2–3 mL per litre water. Soil drench: 4–5 mL per litre water. Apply at vegetative, flowering, and fruit-fill stages. For best results apply 3–4 times per crop season. Safe for all crops.",
  },
  {
    name: "Amino Acid Growth Booster",
    category: "Plant Growth Promoters",
    price: 1200,
    stockQuantity: 200,
    inStock: true,
    visible: true,
    image: "https://images.unsplash.com/photo-1583209814683-c023dd293cc6?w=600&q=80",
    description:
      "Hydrolysed plant-based amino acid concentrate (40% total amino acids) for rapid plant growth stimulation. Provides ready-to-absorb amino acids that bypass biosynthesis, saving plant energy for growth. Improves yield by 15–25% in field trials.",
    benefits:
      "• 40% total amino acids in plant-available form\n• Bypasses energy-intensive biosynthesis in plants\n• Improves chlorophyll content and photosynthesis\n• Enhances protein synthesis for better crop quality\n• Improves tolerance to abiotic stresses",
    usageInstructions:
      "Foliar spray: 2–3 mL per litre water. Soil application: 4–5 mL per litre water. Apply at vegetative, pre-flowering, and grain-fill stages. Avoid application during flowering. Can be mixed with micronutrients.",
  },
  {
    name: "Root Development Promoter",
    category: "Plant Growth Promoters",
    price: 980,
    stockQuantity: 240,
    inStock: true,
    visible: true,
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80",
    description:
      "Mycorrhiza + Trichoderma + humic acid combination product for enhanced root development and soil colonisation. Mycorrhizal fungi extend root system 10–100 times beyond root hair zone, dramatically improving water and nutrient uptake efficiency.",
    benefits:
      "• Extends effective root system by 10–100×\n• Enhances phosphorus and water uptake\n• Trichoderma provides biological disease control\n• Reduces transplant shock in seedlings\n• Improves overall plant establishment and vigour",
    usageInstructions:
      "Seed treatment: 10 g per kg seeds. Soil application: 2–3 kg per acre mixed with compost near root zone. For transplants: dip roots in 1% solution for 30 minutes. Apply at sowing or transplanting only.",
  },

  // ─── CROP PROTECTION NUTRIENTS ───────────────────────────────────────────
  {
    name: "Calcium Nitrate Crop Nutrition",
    category: "Crop Protection Nutrients",
    price: 1150,
    stockQuantity: 220,
    inStock: true,
    visible: true,
    image: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=600&q=80",
    description:
      "100% water-soluble calcium nitrate (15.5% N + 19% Ca) for preventing calcium deficiency disorders. Prevents blossom end rot in tomato and pepper, tip burn in lettuce, bitter pit in apple. Provides both available calcium and nitrogen through drip or foliar.",
    benefits:
      "• Prevents blossom end rot in tomato, capsicum\n• Prevents tip burn in lettuce and leafy vegetables\n• Improves cell wall strength and fruit firmness\n• Enhances post-harvest shelf life\n• Only water-soluble calcium fertilizer for drip systems",
    usageInstructions:
      "Drip fertigation: 5–8 kg per acre per application. Foliar spray: 2–4 g per litre water. Apply from fruit set onwards for tomato and capsicum. For apples: 3 foliar sprays at 10-day intervals after petal fall.",
  },
  {
    name: "Potassium Silicate",
    category: "Crop Protection Nutrients",
    price: 1280,
    stockQuantity: 160,
    inStock: true,
    visible: true,
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&q=80",
    description:
      "Liquid potassium silicate for improving crop physical resistance to diseases and pests. Silicon strengthens cell walls, making them more resistant to fungal penetration and insect feeding. Reduces fungicide and pesticide requirements.",
    benefits:
      "• Strengthens cell walls against pest and disease penetration\n• Reduces fungal diseases (powdery mildew, blast)\n• Improves crop tolerance to drought and heat\n• Reduces need for pesticide applications\n• Improves lodging resistance in cereals",
    usageInstructions:
      "Foliar spray: 2–3 mL per litre water. Apply preventively every 14–21 days. For disease control: apply at first sign of disease and repeat after 10 days. Excellent when combined with copper-based fungicides.",
  },
  {
    name: "Chelated Multi-Micronutrient Mix",
    category: "Crop Protection Nutrients",
    price: 1450,
    stockQuantity: 140,
    inStock: true,
    visible: true,
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&q=80",
    description:
      "EDTA-chelated multi-micronutrient formulation containing zinc, iron, manganese, copper, boron, and molybdenum. Corrects multiple micronutrient deficiencies simultaneously. Fully water-soluble and compatible with most fertilizers and pesticides.",
    benefits:
      "• Complete micronutrient spectrum in one product\n• EDTA chelation ensures high plant availability\n• Prevents multiple deficiency symptoms\n• Improves enzyme activity and metabolic functions\n• Compatible with most crop protection products",
    usageInstructions:
      "Foliar spray: 2–3 g per litre water. Soil application: 3–5 kg per acre. Apply at vegetative stage and repeat at flowering. For high-value crops: apply every 20 days throughout season.",
  },
];

// ── Main Seed Function ───────────────────────────────────────────────────────
async function seed() {
  console.log("🌱 Starting product seed...\n");

  // Check existing
  const existing = await prisma.product.count();
  if (existing > 0) {
    console.log(`ℹ️  Found ${existing} existing products. Clearing before re-seeding...`);
    // Delete chat message references first
    await prisma.$executeRawUnsafe(`DELETE FROM "ChatMessageProduct"`);
    await prisma.product.deleteMany({});
    console.log("✅ Cleared existing products.\n");
  }

  // Insert products
  let count = 0;
  for (const product of products) {
    await prisma.product.create({ data: product });
    count++;
    process.stdout.write(`   ✅ [${count.toString().padStart(2, "0")}/${products.length}] ${product.name}\n`);
  }

  // Summary
  console.log("\n" + "─".repeat(60));
  console.log(`🎉 Seed complete!`);
  console.log(`   Total products inserted : ${count}`);

  // Category breakdown
  const cats = [...new Set(products.map((p) => p.category))];
  console.log(`   Total categories        : ${cats.length}`);
  console.log("\n   Categories:");
  for (const cat of cats) {
    const n = products.filter((p) => p.category === cat).length;
    console.log(`     • ${cat.padEnd(35)} ${n} products`);
  }
  console.log("─".repeat(60) + "\n");
}

seed()
  .catch((err) => {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
