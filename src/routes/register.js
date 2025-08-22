import bcrypt from 'bcrypt';
import validator from 'validator';
import { BCRYPT_SALT_ROUNDS } from '../constants.js';

export const register = async (req, res) => {
    const { username, password, email, graduation_year, role } = req.body;
    const db = req.db;

    // 验证请求参数
    const requiredFields = { username, password, email, graduation_year, role };
    for (const [key, value] of Object.entries(requiredFields)) {
        if (!value || (typeof value === 'string' && value.trim() === '')) {
            return res.status(400).json({ message: `${key} 不能为空` });
        }
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
    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    // 插入新用户
    await db.query(
        'INSERT INTO accounts (username, password, graduation_year, email, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email',
        [username, hashedPassword, graduation_year, email, role]
    );

    // console.log(`用户 ${username} 被添加，所使用的邮箱为 ${email}（${graduation_year}届）`);

    return res.status(201).json({
        message: '注册成功',
    });
};