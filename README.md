# ShopCart - Full Stack MERN E-Commerce Platform

A modern, responsive e-commerce web application built with the MERN stack (MongoDB, Express, React, Node.js) and styled with clean, modern CSS. Features include user authentication, product catalog with search & filtering, wishlist, shopping cart, checkout flow with Razorpay integration, order management, and user dashboard.

---

## 🚀 Features

- **Authentication & Authorization**: Secure JWT-based authentication with HTTP-only cookies, password hashing with bcrypt, protected routes, and user profile management.
- **Product Catalog**: Dynamic catalog browsing, real-time search, category filtering, stock tracking, and detailed product views.
- **Wishlist & Cart**: Persistent per-user wishlist and cart management with instant optimistic updates and badge counts.
- **Checkout & Payment**: Integrated Razorpay payment gateway workflow with simulated and production-ready order verification.
- **Order Tracking**: Order placement, order history tracking, and detailed order invoices.
- **Responsive & Modern UI**: Built with React, Vite, Lucide icons, and modern design principles.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, React Router DOM, Lucide Icons, Modern CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (`jsonwebtoken`), `bcryptjs`, `cookie-parser`
- **Payment Processing**: Razorpay Node SDK
- **Security**: CORS, sanitized environment configs, HTTP-only cookies

---

## 📁 Project Structure

```text
shopcart-project/
├── .env.example              # Sample frontend environment config
├── .gitignore                # Root gitignore rules
├── index.html                # Vite HTML entry point
├── package.json              # Frontend dependencies and scripts
├── vite.config.js            # Vite configuration & proxy settings
├── src/                      # Frontend source code
│   ├── components/           # Reusable UI components (Navbar, Cards, Search)
│   ├── context/              # Context providers (CartContext)
│   ├── pages/                # Route pages (Home, Products, Cart, Checkout, etc.)
│   └── services/             # API services (Axios / Fetch client)
└── server/                   # Backend API server
    ├── .env.example          # Sample backend environment config
    ├── config/               # DB & third-party configs (Razorpay)
    ├── controllers/          # Business logic handlers
    ├── middlewares/          # Auth & validation middleware
    ├── models/               # Mongoose schemas (Customer, Product, Order)
    ├── routes/               # Express API endpoints
    ├── seed.js               # Database seed script for products
    └── index.js              # Express app entry point
```

---

## ⚙️ Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/thekrishmellow/shopcart-project.git
cd shopcart-project
```

### 2. Configure Environment Variables

**Backend (`server/.env`)**:
Copy the example config and provide your credentials:
```bash
cp server/.env.example server/.env
```
Update `server/.env` with your values:
```env
PORT=8003
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

**Frontend (`.env`)** *(Optional for local dev with Vite proxy)*:
```bash
cp .env.example .env
```
For local development, Vite proxies `/api` requests to `http://localhost:8003`. For separate deployments, set `VITE_API_URL` to your production backend URL.

---

### 3. Install Dependencies & Run

**Start Backend**:
```bash
cd server
npm install
# Seed initial sample products (optional)
node seed.js
# Start server
npm run dev # or npm start
```

**Start Frontend**:
```bash
# In the root project directory
npm install
npm run dev
```

The application will be running at `http://localhost:5173`.

---

## 🔒 Security Best Practices

- Real credentials and environment files (`.env`, `.env.*`) are never committed to version control.
- Sensitive authentication tokens are stored in secure HTTP-only cookies.
- Password hashing is enforced using `bcryptjs` with salt rounds.

---

## 📄 License

This project is licensed under the MIT License.