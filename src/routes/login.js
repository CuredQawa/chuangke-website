import { setTokenCookie, signToken } from '../middleware/auth.js';
import bcrypt from 'bcrypt';

const login = async (req, res) => {
    const { email, password } = req.body;

    // 验证请求参数
    if (!email || !password) {
        return res.status(400).json({ message: '用户名和密码是必需的' });
    }

    const db = req.db;
    const result = await db.query(
        'SELECT id, username, password, email FROM accounts WHERE email = $1',
        [email]
    );

    // 验证凭据
    if (result.rows.length > 0) {
        const user = result.rows[0];

        // 验证密码
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

            return res.json({
                message: '登录成功',
            });
        }
    }

    return res.status(401).json({ message: '用户名或密码错误' });
};

// 登出功能
const logout = (req, res) => {
    res.clearCookie('token');
    return res.json({ message: '登出成功' });
};

// 获取当前用户信息
const getCurrentUser = (req, res) => {
    res.json({
        user: req.user
    });
};

export { login, logout, getCurrentUser };