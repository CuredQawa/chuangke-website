import bcrypt from 'bcrypt';
import { setTokenCookie, signToken } from '../middleware/auth.js';
import validator from 'validator';

export const register = async (req, res) => {
    const { username, password, email, graduationYear } = req.body;
    const db = req.db;

    // 验证请求参数
    if (!username || !password || !email || !graduationYear) {
        return res.status(400).json({ message: '所有字段都是必需的' });
    }

    // 邮箱格式验证
    if (!validator.isEmail(email)) {
        return res.status(400).json({ message: '邮箱格式不正确' });
    }

    // 检查邮箱是否已存在
    const emailCheck = await db.query(
        'SELECT id FROM accounts WHERE email = $1',
        [email]
    );

    if (emailCheck.rows.length > 0) {
        return res.status(409).json({ message: '该邮箱已被注册' });
    }

    // 密码加密
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 插入新用户
    const result = await db.query(
        'INSERT INTO accounts (username, password, graduation_year, email, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email',
        [username, hashedPassword, graduationYear, email, 'user'] // 默认角色为 user
    );

    const newUser = result.rows[0];

    // 签发 JWT 令牌
    const token = signToken({
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
    });

    // 设置 cookie
    setTokenCookie(res, token);

    return res.status(201).json({
        message: '注册成功',
    });
};