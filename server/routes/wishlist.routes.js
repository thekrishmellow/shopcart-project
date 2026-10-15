import express from 'express';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import {
    addToWishlist,
    getWishlist,
    removeFromWishlist,
    toggleWishlist
} from '../controllers/wishlist.controller.js';

const router = express.Router();

// All wishlist routes require authentication
router.use(isAuthenticated);

router.get('/', getWishlist);
router.post('/:productId', addToWishlist);
router.delete('/:productId', removeFromWishlist);
router.patch('/:productId/toggle', toggleWishlist);

export default router;
