import Customer from "../models/customer.model.js";
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import generateToken from "../utils/generateToken.js";

const isProduction = process.env.NODE_ENV === 'production';

const cookieOptions = {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: isProduction ? 'none' : 'lax',
    secure: isProduction,
};

export const registerCustomer = async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({
                message: 'Database is not connected. Please verify MONGO_URI in Render environment settings and ensure 0.0.0.0/0 is whitelisted in MongoDB Atlas Network Access.'
            });
        }

        const { fullName, email, password, phone } = req.body;

        if (!fullName || !email || !password || !phone) {
            return res.status(400).json({ message: 'All fields Required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password should be at least 6 characters' });
        }

        const emailExists = await Customer.findOne({ email });

        if (emailExists) {
            return res.status(409).json({ message: 'Email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newCustomer = await Customer.create({
            fullName,
            email,
            password: hashedPassword,
            phone
        });

        const token = generateToken(newCustomer._id);
        res.cookie('token', token, cookieOptions);

        return res.status(201).json({
            success: true,
            message: "Customer registered successfully",
            token,
            customer: {
                _id: newCustomer._id,
                fullName: newCustomer.fullName,
                email: newCustomer.email,
                phone: newCustomer.phone
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ message: error.message || 'Something went wrong' });
    }
};

export const loginCustomer = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'All fields Required' });
        }

        const customer = await Customer.findOne({ email });

        if (!customer) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, customer.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = generateToken(customer._id);

        res.cookie('token', token, cookieOptions);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            customer: {
                _id: customer._id,
                fullName: customer.fullName,
                email: customer.email,
                phone: customer.phone
            }
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Something went wrong' });
    }
};

export const getMe = async (req, res) => {
    // req.user is set by the auth middleware
    const { _id, fullName, email, phone } = req.user;

    return res.status(200).json({
        success: true,
        _id,
        fullName,
        email,
        phone
    });
};

export const logoutCustomer = async (req, res) => {
    res.clearCookie('token', cookieOptions);

    return res.status(200).json({
        success: true,
        message: "Logged out successfully"
    });
};

export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current password and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters' });
        }

        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, customer.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect current password' });
        }

        const salt = await bcrypt.genSalt(10);
        customer.password = await bcrypt.hash(newPassword, salt);
        await customer.save();

        return res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Something went wrong' });
    }
};
