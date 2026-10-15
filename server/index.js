import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import customerRoutes from './routes/customer.routes.js';
import productRoutes from './routes/product.routes.js';
import wishlistRoutes from './routes/wishlist.routes.js';
import cartRoutes from './routes/cart.routes.js';
import orderRoutes from './routes/order.routes.js';
import Product from './models/product.model.js';
import { sampleProducts } from './seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const app = express();

// Trust reverse proxy (Render, Vercel, Railway, Heroku) for secure cookies & HTTPS
app.set('trust proxy', 1);

const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:4173',
    'http://127.0.0.1:4173',
    'http://localhost:3000',
    process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, postman) or matching allowed origins
        if (!origin || allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
            callback(null, true);
        } else {
            callback(null, true);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(cookieParser());

// Health Check Endpoint (useful for deployment monitoring on Render/Railway)
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve frontend static assets from dist if available
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// For browser navigation (GET requests accepting text/html), serve the React SPA index.html
app.use((req, res, next) => {
    const acceptsHtml = req.headers.accept && req.headers.accept.includes('text/html');
    if (req.method === 'GET' && acceptsHtml && !req.path.startsWith('/health')) {
        const indexPath = path.join(distPath, 'index.html');
        return res.sendFile(indexPath, (err) => {
            if (err) next();
        });
    }
    next();
});

// API Routes (mounted both at /api and root paths for maximum compatibility)
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

app.use('/customers', customerRoutes);
app.use('/products', productRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);

// Fallback for Single Page Application routing (any remaining unhandled requests)
app.use((req, res) => {
    if (req.method === 'GET') {
        const indexPath = path.join(distPath, 'index.html');
        return res.sendFile(indexPath, (err) => {
            if (err) {
                res.status(404).json({ message: 'Resource not found' });
            }
        });
    }
    res.status(404).json({ message: 'Resource not found' });
});

// MongoDB Connection & Auto-seeding
if (process.env.MONGO_URI) {
    mongoose.connect(process.env.MONGO_URI)
        .then(async () => {
            console.log('MongoDB connected successfully');
            try {
                const count = await Product.countDocuments();
                if (count === 0 && Array.isArray(sampleProducts) && sampleProducts.length > 0) {
                    console.log('Database has 0 products. Auto-seeding initial products...');
                    await Product.insertMany(sampleProducts);
                    console.log(`Seeded ${sampleProducts.length} initial products successfully!`);
                }
            } catch (seedErr) {
                console.log('Auto-seed check notice:', seedErr.message);
            }
        })
        .catch((err) => console.log('MongoDB connection error:', err.message));
} else {
    console.warn('WARNING: MONGO_URI is not set in environment variables!');
}

const PORT = process.env.PORT || 8003;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});