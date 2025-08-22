import { setTokenCookie, signToken } from '../middleware/auth.js';
import bcrypt from 'bcrypt';

export const login = async (req, res) => {
    const { email, password } = req.body;
    
    console.log(`用户[${email}]请求登录`);//测试&监控，打印到控制台
    
    // 验证请求参数
    if (!email || !password) {
        return res.status(400).json({ message: '邮箱和密码是必需的' });
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
        
        // 密码正确则：
        if (isPasswordValid) {
            console.log(`用户密码正确`)// 测试&监控，密码正确时打印到控制台
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
        }else{
            console.log(`用户密码错误`)// 测试&监控，密码错误时打印到控制台
        }
    }

    return res.status(401).json({ message: '邮箱或密码错误' });
};

// 登出功能
export const logout = (req, res) => {
    // const { email } = req.body;
    console.log(`一个用户已登出`);//测试&监控，打印到控制台
    res.clearCookie('token');
    return res.json({ message: '登出成功' });
};
