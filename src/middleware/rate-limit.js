/**
 * 速率限制中间件
 * 用于保护登录、注册等敏感端点
 */

import rateLimit from 'express-rate-limit';

/**
 * 登录端点：每IP每15分钟最多10次
 */
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: '登录尝试次数过多，请15分钟后再试' }
});

/**
 * 注册端点：每IP每小时最多5次（管理员操作，但多一层防御）
 */
export const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: '注册请求过于频繁，请稍后再试' }
});

/**
 * 上传端点：每IP每小时最多30次
 */
export const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: '上传过于频繁，请稍后再试' }
});

/**
 * 全局API速率限制：每IP每分钟最多100次
 */
export const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: '请求过于频繁，请稍后再试' }
});
