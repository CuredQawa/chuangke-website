import { BCRYPT_SALT_ROUNDS } from "../constants.js"
import bcrypt from "bcrypt"

export const getAllAccounts = async (req, res) => {
    const db = req.db;
    const result = await db.query('SELECT id, username, graduation_year, email, role FROM accounts');
    res.json(result.rows);
}

export const getAccountInfo = async (req, res) => {
    const db = req.db;
    const result = await db.query('SELECT id, username, graduation_year, email, role FROM accounts WHERE id = $1', [req.user.id]);
    res.json(result.rows[0]);
}

export const editAccount = async (req, res) => {
    const id = req.params.id;
    const { username, graduation_year, password, email, role } = req.body;
    const db = req.db;

    let result;
    if (password && password.trim() !== '') {
        const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
        result = await db.query('UPDATE accounts SET username = $1, graduation_year = $2, email = $3, role = $4, password = $5 WHERE id = $6', [username, graduation_year, email, role, hashedPassword, id]);
    } else {
        result = await db.query('UPDATE accounts SET username = $1, graduation_year = $2, email = $3, role = $4 WHERE id = $5', [username, graduation_year, email, role, id]);
    }

    if (result.rowCount === 0) {
        return res.status(404).json({ message: '用户不存在' });
    }

    res.json({ message: '账户信息已更新' });
}
export const deleteAccount = async (req, res) => {
    const id = req.params.id;
    const query = 'DELETE FROM accounts WHERE id = $1';

    const result = await req.db.query(query, [id]);
    if (result.rowCount === 0) {
        return res.status(404).json({ message: '用户不存在' });
    } else {
        res.json({ message: '账户已删除' });
    }
}