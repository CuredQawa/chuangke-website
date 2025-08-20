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

const dbMiddleware = (req, _, next) => {
    req.db = pool;
    next();
};

export default dbMiddleware;