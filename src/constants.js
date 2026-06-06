/**
 * 应用程序常量配置文件
 * 包含端口号、加密参数、Cookie设置等常量
 */

/**
 * 应用程序运行端口号
 * @type {number}
 */
export const RUNNING_PORT = 3000;

/**
 * bcrypt 加密的盐轮数
 * @type {number}
 */
export const BCRYPT_SALT_ROUNDS = 12;

/**
 * Cookie 最大存活时间（毫秒）
 * @type {number}
 */
export const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7天

/**
 * JWT 令牌最大存活时间
 * @type {string}
 */
export const JWT_MAX_AGE = "7d";

/**
 * 图片上传目录
 * @type {string}
 */
export const IMAGE_UPLOAD_DIR = "public/images/uploads"

/**
 * 图片最大大小限制（字节）
 * @type {number}
 */
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * 标题最大长度
 * @type {number}
 */
export const MAX_TITLE_LENGTH = 200;

/**
 * 内容最大长度（markdown 原文）
 * @type {number}
 */
export const MAX_CONTENT_LENGTH = 100000;

/**
 * 图片描述最大长度
 * @type {number}
 */
export const MAX_DESCRIPTION_LENGTH = 500;