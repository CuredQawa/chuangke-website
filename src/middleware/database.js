import pg from 'pg';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 从环境变量中获取数据库URL
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    console.error("请设置环境变量 DATABASE_URL");
    process.exit(1);
}

// 创建 PostgreSQL 连接池
const pool = new pg.Pool({
    connectionString: databaseUrl,
});

const dbMiddleware = (req, _, next) => {
    req.db = pool;
    next();
};

export default dbMiddleware;