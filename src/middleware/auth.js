import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: '未授权' });
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    });
    // TODO
};

export default authMiddleware;