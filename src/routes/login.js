/**
 * 登录路由
 * 提供用户登录和登出功能
 */

import { setTokenCookie, signToken } from '../middleware/auth.js';
import bcrypt from 'bcrypt';

/**
 * 用户登录
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
export const login = async (req, res) => {
    const { email, password } = req.body;

    // console.log(`用户 ${email} 请求登录`);

    if (!email || !password) {
        return res.status(400).json({ message: '邮箱和密码是必需的' });
    }

    try {
        const db = req.db;
        const result = await db.query(
            'SELECT id, username, password, email FROM accounts WHERE email = $1',
            [email]
        );

        if (result.rows.length > 0) {
            const user = result.rows[0];

            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (isPasswordValid) {
                // 签发 JWT 令牌
                const token = signToken({
                    id: user.id,
                });

                // 设置 cookie
                setTokenCookie(res, token);

                // console.log(`用户 ${email} 登录成功`);
                return res.json({
                    message: '登录成功',
                });
            }
        }

        return res.status(401).json({ message: '邮箱或密码错误' });
    } catch (err) {
        console.error("数据库错误:", err);
        res.status(500).json({ message: "服务器内部错误" });
    }
};

/**
 * 用户登出
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
export const logout = (req, res) => {
    res.clearCookie('token');
    return res.json({ message: '登出成功' });
};