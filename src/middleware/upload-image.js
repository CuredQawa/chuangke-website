/**
 * 图片上传中间件
 * 处理图片文件上传和验证
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { IMAGE_UPLOAD_DIR, MAX_IMAGE_SIZE } from '../constants.js';

// 确保上传目录存在
const uploadDir = path.join(process.cwd(), IMAGE_UPLOAD_DIR);
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置磁盘存储
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // 生成文件名: 上传时间+用户名
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const username = req.user ? req.user.username : 'unknown';
        const fileExtension = path.extname(file.originalname);
        const fileName = `${timestamp}-${username}${fileExtension}`;
        cb(null, fileName);
    }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
    // 验证文件类型（只允许图片）
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('只允许上传 JPEG、PNG、GIF 或 WebP 格式的图片'), false);
    }
};

// multer 实例
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: MAX_IMAGE_SIZE
    }
});

/**
 * 图片上传中间件
 * 处理文件上传和info字段解析
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 */
const uploadImageMiddleware = (req, res, next) => {
    const singleUpload = upload.single('image');

    singleUpload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: '文件大小超过限制' });
            }
            if (err.code === 'LIMIT_FIELD_KEY' || err.code === 'FIELD_KEY_MISSING') {
                return res.status(400).json({
                    message: '字段名缺失，请确保使用字段名"image"上传文件'
                });
            }
            return res.status(400).json({ message: '文件上传错误: ' + err.message });
        } else if (err) {
            return res.status(400).json({ message: '文件上传失败: ' + err.message });
        }

        // 解析info字段中的JSON
        if (req.body && req.body.info) {
            try {
                req.body.info = JSON.parse(req.body.info);
            } catch {
                return res.status(400).json({ message: 'info 字段必须是有效的JSON格式' });
            }
        }

        next();
    });
};

/**
 * 校验 cover_image_url 是否合法
 * 拒绝 javascript: / vbscript: / data: (非 image) 等危险 URL
 */
const SAFE_URL_REGEX = /^(https?:\/\/[^\s]+|\/[^\s]*)$/i;

export const sanitizeCoverImageUrl = (url) => {
    if (!url) return null;
    const trimmed = String(url).trim();
    if (!trimmed) return null;
    if (/^javascript:/i.test(trimmed)) return null;
    if (/^vbscript:/i.test(trimmed)) return null;
    if (/^data:/i.test(trimmed) && !/^data:image\//i.test(trimmed)) return null;
    if (!SAFE_URL_REGEX.test(trimmed)) return null;
    if (trimmed.length > 500) return null;
    return trimmed;
};

export { uploadImageMiddleware };