import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from './models/product.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

export const sampleProducts = [
    {
        name: "Mechanical Keyboard",
        description: "RGB mechanical keyboard with hot-swappable blue switches, aircraft-grade aluminum frame, and customizable backlighting profiles.",
        price: 2999,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
        stock: 15
    },
    {
        name: "Noise Cancelling Headphones",
        description: "Wireless over-ear headphones with active noise cancellation, 40-hour battery life, and crystal clear spatial audio.",
        price: 4999,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
        stock: 25
    },
    {
        name: "Wireless Ergonomic Mouse",
        description: "Precision laser sensor with 4000 DPI, silent click switches, USB-C fast charging, and dual bluetooth/2.4GHz connectivity.",
        price: 1499,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80",
        stock: 18
    },
    {
        name: "Ultra HD 4K Action Camera",
        description: "Waterproof up to 30m with dual color screens, 6-axis electronic image stabilization, and 4K/60fps video capture.",
        price: 8499,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80",
        stock: 8
    },
    {
        name: "Classic Denim Jacket",
        description: "Premium washed cotton denim jacket with reinforced metal buttons, tailored comfort fit, and timeless vintage design.",
        price: 2499,
        category: "Fashion",
        image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80",
        stock: 20
    },
    {
        name: "Minimalist Leather Sneaker",
        description: "Handcrafted full-grain leather sneakers with cushioned memory foam insole and durable vulcanized rubber outsole.",
        price: 3799,
        category: "Fashion",
        image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80",
        stock: 12
    },
    {
        name: "Cotton Crewneck Sweatshirt",
        description: "Heavyweight 380 GSM organic french terry cotton sweatshirt with ribbed collar and cuffs for everyday relaxed wear.",
        price: 1299,
        category: "Fashion",
        image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
        stock: 30
    },
    {
        name: "Designing Data-Intensive Applications",
        description: "The definitive guide to the architecture, reliability, scalability, and maintainability of modern data systems by Martin Kleppmann.",
        price: 1899,
        category: "Books",
        image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
        stock: 14
    },
    {
        name: "Clean Code: A Handbook of Agile Software Craftsmanship",
        description: "Master the principles, patterns, and practices of writing clean, maintainable, and elegant software code by Robert C. Martin.",
        price: 1450,
        category: "Books",
        image: "https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?auto=format&fit=crop&w=800&q=80",
        stock: 22
    },
    {
        name: "Ceramic Pour-Over Coffee Maker Set",
        description: "Artisan matte ceramic dripper with heat-resistant borosilicate glass server and reusable stainless steel micro-mesh filter.",
        price: 1999,
        category: "Home",
        image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
        stock: 9
    },
    {
        name: "Aroma Diffuser & Ambient Lamp",
        description: "Ultrasonic cool mist aromatherapy diffuser with 7-color ambient LED lighting, timer settings, and ultra-quiet operation.",
        price: 1699,
        category: "Home",
        image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80",
        stock: 16
    },
    {
        name: "Nordic Minimalist Desk Lamp",
        description: "Sleek matte finish architect desk lamp with 3 color temperatures, stepless touch dimming, and flexible gooseneck arm.",
        price: 2199,
        category: "Home",
        image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
        stock: 11
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for seeding...");

        // Remove existing products to avoid duplicates on re-run
        await Product.deleteMany({});
        console.log("Cleared existing products.");

        const createdProducts = await Product.insertMany(sampleProducts);
        console.log(`Successfully seeded ${createdProducts.length} products into MongoDB!`);

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error("Seeding error:", error);
        process.exit(1);
    }
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    seedDB();
}
