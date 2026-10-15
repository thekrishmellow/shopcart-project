import mongoose from 'mongoose';
import Customer from '../models/customer.model.js';
import Product from '../models/product.model.js';

/**
 * @desc    Add product to cart (or increment quantity if already in cart)
 * @route   POST /cart/:productId
 * @access  Private
 */
export const addToCart = async (req, res) => {
    try {
        const { productId } = req.params;

        // 1. Validate productId format
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID'
            });
        }

        // 2. Find product in DB
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

        // 4. Check if product already exists in cart
        const cartItemIndex = customer.cart.findIndex(
            (item) => item.product.toString() === productId.toString()
        );

        const currentQty = cartItemIndex > -1 ? customer.cart[cartItemIndex].quantity : 0;
        const targetQty = currentQty + 1;

        // 5. Stock limit validation
        if (targetQty > product.stock) {
            return res.status(400).json({
                success: false,
                message: 'Quantity exceeds available stock'
            });
        }

        // 6. Add or update item in cart
        if (cartItemIndex > -1) {
            customer.cart[cartItemIndex].quantity = targetQty;
        } else {
            customer.cart.push({
                product: productId,
                quantity: 1
            });
        }

        await customer.save();
        await customer.populate({
            path: 'cart.product',
            select: 'name description price category image stock createdAt'
        });

        const activeCart = (customer.cart || []).filter((item) => item.product !== null);

        return res.status(200).json({
            success: true,
            message: 'Product added to cart',
            cart: activeCart
        });
    } catch (error) {
        console.error('Error adding to cart:', error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong while adding product to cart'
        });
    }
};

/**
 * @desc    Get current user's cart
 * @route   GET /cart
 * @access  Private
 */
export const getCart = async (req, res) => {
    try {
        const customer = await Customer.findById(req.user._id).populate({
            path: 'cart.product',
            select: 'name description price category image stock createdAt'
        });

        if (!customer) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        const activeCart = (customer.cart || []).filter((item) => item.product !== null);

        return res.status(200).json({
            success: true,
            cart: activeCart
        });
    } catch (error) {
        console.error('Error fetching cart:', error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong while fetching cart'
        });
    }
};

/**
 * @desc    Update product quantity in cart
 * @route   PATCH /cart/:productId
 * @access  Private
 */
export const updateCartQuantity = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        // 1. Validate productId format
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID'
            });
        }

        // 2. Validate quantity parameter
        if (quantity === undefined || typeof quantity !== 'number' || Number.isNaN(quantity) || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be a number greater than or equal to 1'
            });
        }

        // 3. Find product in DB
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // 4. Find authenticated customer
        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        // 5. Check if product exists in user's cart
        const cartItemIndex = customer.cart.findIndex(
            (item) => item.product.toString() === productId.toString()
        );

        if (cartItemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Product not in cart'
            });
        }

        // 6. Validate quantity against stock limit
        if (quantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: 'Quantity exceeds available stock'
            });
        }

        // 7. Update quantity & save
        customer.cart[cartItemIndex].quantity = quantity;
        await customer.save();

        await customer.populate({
            path: 'cart.product',
            select: 'name description price category image stock createdAt'
        });

        const activeCart = (customer.cart || []).filter((item) => item.product !== null);

        return res.status(200).json({
            success: true,
            message: 'Cart updated successfully',
            cart: activeCart
        });
    } catch (error) {
        console.error('Error updating cart quantity:', error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong while updating cart quantity'
        });
    }
};

/**
 * @desc    Remove product from cart
 * @route   DELETE /cart/:productId
 * @access  Private
 */
export const removeFromCart = async (req, res) => {
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

        // 3. Check if product exists in cart
        const cartItemIndex = customer.cart.findIndex(
            (item) => item.product.toString() === productId.toString()
        );

        if (cartItemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Product not in cart'
            });
        }

        // 4. Remove item & save
        customer.cart.splice(cartItemIndex, 1);
        await customer.save();

        await customer.populate({
            path: 'cart.product',
            select: 'name description price category image stock createdAt'
        });

        const activeCart = (customer.cart || []).filter((item) => item.product !== null);

        return res.status(200).json({
            success: true,
            message: 'Product removed from cart',
            cart: activeCart
        });
    } catch (error) {
        console.error('Error removing from cart:', error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong while removing product from cart'
        });
    }
};
