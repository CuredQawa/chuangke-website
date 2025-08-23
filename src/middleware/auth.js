/**
 * 用户认证中间件
 * 提供JWT令牌验证和用户权限控制功能
 */

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { COOKIE_MAX_AGE, JWT_MAX_AGE } from '../constants.js';

// 检查环境变量
dotenv.config();
if (!process.env.JWT_SECRET) {
    throw new Error('请设置环境变量 JWT_SECRET');
}

/**
 * 通用认证函数
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {string} requiredRole - 所需角色('user'或'admin')
 * @param {Function} next - 下一个中间件函数
 */
const auth = (req, res, requiredRole, next) => {
    let token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: '未授权' });
    }

    // 验证 token 是否有效
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: '令牌无效' });
        } else {
            // 从数据库中获取用户信息
            const query = 'SELECT id, username, graduation_year, email, role FROM accounts WHERE id = $1';
            const result = await req.db.query(query, [decoded.id]);

            if (result.rows.length === 0) {
                return res.status(404).json({ message: '用户不存在' });
            }

            const user = result.rows[0];

            // 管理员需要特殊角色，普通用户只要账户存在即可
            if (requiredRole === 'admin' && user.role !== 'admin') {
                return res.status(403).json({ message: '需要管理员权限' });
            }

            req.user = Object.freeze(user); // 不可变

            next();
        }
    });
};

/**
 * 用户认证中间件
 * 验证用户是否已登录
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 */
export const userAuth = (req, res, next) => {
    auth(req, res, 'user', next);
};

/**
 * 管理员认证中间件
 * 验证用户是否为管理员
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 */
export const adminAuth = (req, res, next) => {
    auth(req, res, 'admin', next);
};

/**
 * 签发JWT令牌
 * @param {Object} payload - 要包含在令牌中的数据
 * @returns {string} JWT令牌
 */
export const signToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: JWT_MAX_AGE });
};

/**
 * 设置令牌Cookie
 * @param {Object} res - 响应对象
 * @param {string} token - JWT令牌
 */
export const setTokenCookie = (res, token) => {
    res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: COOKIE_MAX_AGE
    });
};