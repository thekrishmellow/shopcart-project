import mongoose from "mongoose";
import Product from "../models/product.model.js";

/**
 * @desc    Create a new product
 * @route   POST /products
 * @access  Public (for Lab 03)
 */
export const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, image, stock } = req.body;

        // Validation for missing required fields
        if (
            name === undefined || name === null || name === '' ||
            description === undefined || description === null || description === '' ||
            price === undefined || price === null || price === '' ||
            category === undefined || category === null || category === '' ||
            image === undefined || image === null || image === '' ||
            stock === undefined || stock === null || stock === ''
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields (name, description, price, category, image, stock) are required"
            });
        }

        const numPrice = Number(price);
        const numStock = Number(stock);

        // Validation for price (> 0)
        if (isNaN(numPrice) || numPrice <= 0) {
            return res.status(400).json({
                success: false,
                message: "Price must be a valid number greater than 0"
            });
        }

        // Validation for stock (>= 0)
        if (isNaN(numStock) || numStock < 0) {
            return res.status(400).json({
                success: false,
                message: "Stock cannot be negative"
            });
        }

        const newProduct = await Product.create({
            name: name.trim(),
            description: description.trim(),
            price: numPrice,
            category: category.trim(),
            image: image.trim(),
            stock: numStock
        });

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            product: newProduct
        });
    } catch (error) {
        console.error("Error creating product:", error);
        if (error.name === "ValidationError") {
            const firstError = Object.values(error.errors)[0]?.message || "Validation error";
            return res.status(400).json({ success: false, message: firstError });
        }
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

/**
 * @desc    Get all products with optional search, category filter, and sorting
 * @route   GET /products
 * @access  Public
 */
export const getProducts = async (req, res) => {
    try {
        const { search, category, sort } = req.query;

        // Build dynamic query object
        const query = {};

        // Case-insensitive search on product name
        if (search && search.trim() !== "") {
            query.name = { $regex: search.trim(), $options: "i" };
        }

        // Category filter (if not "All" or "all")
        if (category && category.trim() !== "" && category.toLowerCase() !== "all") {
            query.category = { $regex: `^${category.trim()}$`, $options: "i" };
        }

        // Handle sorting
        let sortOption = { createdAt: -1 }; // default: newest first
        if (sort === "price_asc") {
            sortOption = { price: 1 };
        } else if (sort === "price_desc") {
            sortOption = { price: -1 };
        } else if (sort === "newest") {
            sortOption = { createdAt: -1 };
        }

        const products = await Product.find(query).sort(sortOption);

        return res.status(200).json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

/**
 * @desc    Get single product by ID
 * @route   GET /products/:id
 * @access  Public
 */
export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.status(200).json({
            success: true,
            product
        });
    } catch (error) {
        console.error("Error fetching product by ID:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
