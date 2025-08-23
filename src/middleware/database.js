/**
 * 数据库中间件
 * 提供PostgreSQL数据库连接池功能
 */

import pg from 'pg';
import dotenv from 'dotenv';

// 从环境变量中获取数据库URL
dotenv.config();
if (!process.env.DATABASE_URL) {
    throw new Error('请设置环境变量 DATABASE_URL');
}

// 创建 PostgreSQL 连接池
const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
});

/**
 * 数据库中间件函数
 * 将数据库连接池附加到请求对象上
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 */
const dbMiddleware = (req, _, next) => {
    req.db = pool;
    next();
};

export default dbMiddleware;