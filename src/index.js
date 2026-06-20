/**
 * 应用程序入口
 * 配置 Express 中间件、路由和监听端口
 */

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import router from './router.js'
import dbMiddleware from './middleware/database.js';
import cookieParser from 'cookie-parser';
import { apiLimiter } from './middleware/rate-limit.js';
import { RUNNING_PORT } from './constants.js';

const app = express();

// 安全头
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://s4.zstatic.net"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://s4.zstatic.net"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            fontSrc: ["'self'", "https:", "data:"],
            connectSrc: ["'self'"],
            frameAncestors: ["'self'"],
            upgradeInsecureRequests: null
        }
    },
    crossOriginEmbedderPolicy: false
}));

// CORS：默认同源（不启用 CORS 头）
// 跨域场景需显式设置 CORS_ORIGIN = https://your.domain，多个 origin 用逗号分隔
const corsOrigins = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

if (corsOrigins.length > 0) {
    app.use(cors({
        origin: (origin, cb) => {
            if (!origin) return cb(null, true);
            if (corsOrigins.includes(origin)) return cb(null, true);
            return cb(new Error('CORS 源不被允许'));
        },
        credentials: true
    }));
}

// 解析请求体
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 数据库连接
app.use(dbMiddleware);

// 静态资源
app.use(express.static("public", {
    setHeaders: (res, filepath) => {
        // 上传目录不允许被跨站脚本直接访问
        if (filepath.includes('/uploads/')) {
            res.setHeader('X-Content-Type-Options', 'nosniff');
        }
    }
}));

// Cookie 解析
app.use(cookieParser());

// 全局 API 限流
app.use('/api', apiLimiter);

// 路由
app.use("/", router);

// 404 处理
app.use((req, res) => {
    res.status(404).json({ message: '资源不存在' });
});

// 全局错误处理
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error('未处理错误:', err);
    res.status(err.status || 500).json({
        message: process.env.NODE_ENV === 'production'
            ? '服务器内部错误'
            : (err.message || '服务器内部错误')
    });
});

app.listen(RUNNING_PORT, () => {
    console.log(`Running on localhost:${RUNNING_PORT}`);
});
