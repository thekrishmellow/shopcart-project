import express from 'express';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import {
    createPaymentOrder,
    verifyPayment,
    getUserOrders,
    getOrderById,
    updateOrderStatus
} from '../controllers/order.controller.js';

const router = express.Router();

// All order endpoints require authentication
router.use(isAuthenticated);

router.post('/create-payment-order', createPaymentOrder);
router.post('/verify-payment', verifyPayment);
router.get('/', getUserOrders);
router.get('/:id', getOrderById);
router.patch('/:id/status', updateOrderStatus);

export default router;
