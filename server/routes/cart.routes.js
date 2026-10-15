import express from 'express';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import {
    addToCart,
    getCart,
    updateCartQuantity,
    removeFromCart
} from '../controllers/cart.controller.js';

const router = express.Router();

// All cart routes require authentication
router.use(isAuthenticated);

router.get('/', getCart);
router.post('/:productId', addToCart);
router.patch('/:productId', updateCartQuantity);
router.delete('/:productId', removeFromCart);

export default router;
