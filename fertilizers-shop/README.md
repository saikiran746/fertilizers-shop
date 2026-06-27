# 🌿 GreenGrow Fertilizers — Full Stack Website

A professional, production-ready fertilizers shop website with a public product catalogue and a private admin panel.

**Tagline:** *Apply Less, Expect More*

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS + Framer Motion |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (admin only) |
| Image Upload | Multer |

---

## Project Structure

```
fertilizers-shop/
├── backend/           Express API + MongoDB
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/       Admin seed script
│   └── uploads/       Product images (auto-created)
├── frontend/          React + Vite SPA
│   └── src/
│       ├── api/
│       ├── components/
│       ├── pages/
│       └── store/
└── README.md
```

---

## Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- npm v9+

---

## Quick Start

### 1 — Clone / Extract

```bash
cd fertilizers-shop
```

### 2 — Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/fertilizers_shop
JWT_SECRET=your_super_secret_key_min_32_chars
JWT_EXPIRES_IN=8h
FRONTEND_ORIGIN=http://localhost:5173
UPLOAD_DIR=./uploads
```

Create admin account (interactive):

```bash
npm run seed
```

Start backend:

```bash
npm run dev        # development (nodemon)
npm start          # production
```

Backend runs at: **http://localhost:5000**

---

### 3 — Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SERVER_URL=http://localhost:5000
VITE_CONTACT_PHONE=+91-98765-43210
VITE_CONTACT_EMAIL=info@fertilizersshop.com
VITE_COMPANY_NAME=GreenGrow Fertilizers
VITE_COMPANY_ADDRESS=123 Agriculture Road, Hyderabad, Telangana 500001
```

Start frontend:

```bash
npm run dev        # development
npm run build      # production build → dist/
```

Frontend runs at: **http://localhost:5173**

---

## Pages

### Public (no login required)

| URL | Page |
|---|---|
| `/` | Home — hero, categories, features, testimonials |
| `/products` | Catalogue with search + category filter |
| `/products/:id` | Product detail + call-to-order popup |
| `/about` | About the company |
| `/contact` | Contact info + enquiry form |

### Admin (JWT protected)

| URL | Page |
|---|---|
| `/admin/login` | Admin login |
| `/admin/dashboard` | Stats overview |
| `/admin/products` | Product list with visibility toggles |
| `/admin/products/new` | Add product with image drag-and-drop |
| `/admin/products/:id/edit` | Edit existing product |

---

## API Endpoints

### Public

```
GET  /api/products              List visible products (?search=&category=&page=&limit=)
GET  /api/products/:id          Single product
GET  /api/categories            All active categories
```

### Auth

```
POST /api/auth/login            { username, password } → { token }
GET  /api/auth/me               Returns logged-in admin info (JWT required)
```

### Admin (Bearer JWT required)

```
GET    /api/admin/products
POST   /api/admin/products      multipart/form-data
PUT    /api/admin/products/:id  multipart/form-data
DELETE /api/admin/products/:id
PATCH  /api/admin/products/:id/visibility
GET    /api/admin/stats
```

---

## Production Deployment

### Build frontend

```bash
cd frontend && npm run build
```

Serve the `dist/` folder via Nginx, Vercel, or Netlify.

### Backend (VPS / Ubuntu)

```bash
npm install -g pm2
cd backend
pm2 start app.js --name fertilizers-api
pm2 save && pm2 startup
```

### MongoDB Atlas

Replace `MONGO_URI` in `.env` with your Atlas connection string.

---

## Customisation Checklist

- [ ] Update company name, phone, email, address in `frontend/.env`
- [ ] Replace placeholder Google Maps URL in `ContactPage.jsx`
- [ ] Customise testimonials text in `HomePage.jsx`
- [ ] Set a strong `JWT_SECRET` (32+ random characters)
- [ ] Run `npm run seed` to create admin credentials
- [ ] Add real product images via the admin panel

---

## Design System

| Token | Value |
|---|---|
| Primary Green | `#2E7D32` |
| Accent Green | `#4CAF50` |
| CTA Blue | `#1565C0` |
| Background | `#F1F8E9` |
| Fonts | Poppins (headings) + Inter (body) |

---

## Security Notes

- Passwords hashed with bcrypt (cost 12)
- JWT tokens expire in 8 hours
- Rate-limiting on `/api/auth/login` (10 req / 15 min per IP)
- Only JPEG / PNG / WebP images accepted, max 5 MB
- CORS restricted to `FRONTEND_ORIGIN` env variable
- No customer accounts or payment data collected

---

*Built with ❤️ for Indian farmers — Apply Less, Expect More 🌾*
