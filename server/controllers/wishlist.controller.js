import mongoose from 'mongoose';
import Customer from '../models/customer.model.js';
import Product from '../models/product.model.js';

/**
 * @desc    Add product to wishlist
 * @route   POST /wishlist/:productId
 * @access  Private
 */
export const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        // 1. Validate productId format
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID'
            });
        }

        // 2. Find product to ensure it exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // 3. Find authenticated customer
        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        // 4. Check for duplicate wishlist entry
        const isAlreadyWishlisted = customer.wishlist.some(
            (id) => id.toString() === productId.toString()
        );

        if (isAlreadyWishlisted) {
            return res.status(409).json({
                success: false,
                message: 'Product already in wishlist'
            });
        }

        // 5. Add product reference to user's wishlist and save
        customer.wishlist.push(productId);
        await customer.save();

        return res.status(200).json({
            success: true,
            message: 'Product added to wishlist'
        });
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong while adding product to wishlist'
        });
    }
};

/**
 * @desc    Get current user's wishlist
 * @route   GET /wishlist
 * @access  Private
 */
export const getWishlist = async (req, res) => {
    try {
        // Authenticated customer with populated wishlist references
        const customer = await Customer.findById(req.user._id).populate({
            path: 'wishlist',
            select: 'name description price category image stock createdAt'
        });

        if (!customer) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        // Filter out any populated items that might be null (e.g. if product was deleted)
        const activeWishlist = (customer.wishlist || []).filter((item) => item !== null);

        return res.status(200).json({
            success: true,
            count: activeWishlist.length,
            wishlist: activeWishlist
        });
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong while fetching wishlist'
        });
    }
};

/**
 * @desc    Remove product from wishlist
 * @route   DELETE /wishlist/:productId
 * @access  Private
 */
export const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        // 1. Validate productId format
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID'
            });
        }

        // 2. Find authenticated customer
        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        // 3. Check if product exists in wishlist
        const index = customer.wishlist.findIndex(
            (id) => id.toString() === productId.toString()
        );

        if (index === -1) {
            return res.status(404).json({
                success: false,
                message: 'Product not in wishlist'
            });
        }

        // 4. Remove reference and save
        customer.wishlist.splice(index, 1);
        await customer.save();

        return res.status(200).json({
            success: true,
            message: 'Product removed from wishlist'
        });
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong while removing product from wishlist'
        });
    }
};

/**
 * @desc    Toggle product in wishlist (Bonus feature)
 * @route   PATCH /wishlist/:productId/toggle
 * @access  Private
 */
export const toggleWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID'
            });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found' 
            });
        }

        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        const index = customer.wishlist.findIndex(
            (id) => id.toString() === productId.toString()
        );

        if (index > -1) {
            customer.wishlist.splice(index, 1);
            await customer.save();
            return res.status(200).json({
                success: true,
                saved: false,
                message: 'Product removed from wishlist'
            });
        } else {
            customer.wishlist.push(productId);
            await customer.save();
            return res.status(200).json({
                success: true,
                saved: true,
                message: 'Product added to wishlist'
            });
        }
    } catch (error) {
        console.error('Error toggling wishlist:', error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong while toggling wishlist product'
        });
    }
};
