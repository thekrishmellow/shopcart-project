import jwt from 'jsonwebtoken';
import Customer from '../models/customer.model.js';

export const isAuthenticated = async (req, res, next) => {
    try {
        let token = req.cookies?.token;
        if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }

        const secret = process.env.JWT_SECRET || 'shopcart_jwt_default_secret_key_safe';
        const decoded = jwt.verify(token, secret);

        const customer = await Customer.findById(decoded.id);

        if (!customer) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        req.user = customer;
        next();

    } catch (error) {
        console.log(error);
        return res.status(401).json({ message: 'Not authenticated' });
    }
};