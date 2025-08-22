import { setTokenCookie, signToken } from '../middleware/auth.js';
import bcrypt from 'bcrypt';

export const login = async (req, res) => {
    const { email, password } = req.body;

    // console.log(`用户 ${email} 请求登录`);

    if (!email || !password) {
        return res.status(400).json({ message: '邮箱和密码是必需的' });
    }

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
                username: user.username,
                email: user.email,
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
};

// 登出功能
export const logout = (req, res) => {
    res.clearCookie('token');
    return res.json({ message: '登出成功' });
};