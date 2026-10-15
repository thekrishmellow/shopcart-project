import express from 'express';
import {
    registerCustomer,
    loginCustomer,
    getMe,
    logoutCustomer,
    changePassword
} from '../controllers/customer.controller.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';

const customerRoutes = express.Router();

customerRoutes.post('/register', registerCustomer);
customerRoutes.post('/login', loginCustomer);
customerRoutes.get('/profile', isAuthenticated, getMe);
customerRoutes.get('/me', isAuthenticated, getMe);
customerRoutes.post('/logout', logoutCustomer);
customerRoutes.patch('/change-password', isAuthenticated, changePassword);

export default customerRoutes;