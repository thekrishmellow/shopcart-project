import jwt from 'jsonwebtoken';

const generateToken = (id) => {
    const secret = process.env.JWT_SECRET || 'shopcart_jwt_default_secret_key_safe';
    return jwt.sign({ id }, secret, {
        expiresIn: '7d'
    });
};

export default generateToken;