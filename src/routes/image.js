/**
 * 图片管理路由
 * 提供图片上传、查询和删除功能
 */

import fs from 'fs';
import path from 'path';
import { IMAGE_UPLOAD_DIR } from '../constants.js';

// 图片上传目录
const uploadDir = path.join(process.cwd(), IMAGE_UPLOAD_DIR);

/**
 * 上传图片
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
export const uploadImage = async (req, res) => {
    // 检查是否有文件上传
    if (!req.file) {
        return res.status(400).json({ message: '没有上传文件' });
    }

    // 检查 description 字段
    if (!req.body || !req.body.info) {
        // 删除已上传的文件
        const filePath = path.join(uploadDir, req.file.filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        return res.status(400).json({ message: '缺少描述信息' });
    }

    try {
        const { info } = req.body;
        const fileName = req.file.filename;

        // 把信息存入数据库
        const query = 'INSERT INTO images (filename, description, author_id) VALUES ($1, $2, $3)';
        await req.db.query(query, [fileName, info.description, req.user.id]);

        res.json({
            fileName,
        });
    } catch (error) {
        // 如果数据库操作失败，删除已上传的文件
        const filePath = path.join(uploadDir, req.file.filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        console.error('上传图片时发生错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
};

/**
 * 删除图片
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
export const deleteImage = async (req, res) => {
    const imageId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    try {
        // 查询图片信息
        const selectQuery = 'SELECT filename, author_id FROM images WHERE id = $1';
        const result = await req.db.query(selectQuery, [imageId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: '图片不存在' });
        }

        const image = result.rows[0];
        const fileName = image.filename;
        const authorId = image.author_id;

        // 用户可以删除自己的图片，管理员可以删除所有图片
        if (userRole !== 'admin' && authorId !== userId) {
            return res.status(403).json({ message: '权限不足，无法删除此图片' });
        }

        // 检查文件是否存在
        const filePath = path.join(uploadDir, fileName);
        if (fs.existsSync(filePath)) {
            // 删除文件
            fs.unlinkSync(filePath);
        }

        // 从数据库中删除记录
        const deleteQuery = 'DELETE FROM images WHERE id = $1';
        await req.db.query(deleteQuery, [imageId]);

        res.json({ message: '图片删除成功' });
    } catch (err) {
        console.error("数据库错误:", err);
        res.status(500).json({ message: "服务器内部错误" });
    }
};

/**
 * 获取所有图片
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
export const getAllImages = async (req, res) => {
    try {
        // 从数据库获取所有图片信息
        const query = 'SELECT id, filename, description, author_id FROM images ORDER BY id DESC';
        const result = await req.db.query(query);

        const images = result.rows.map(row => ({
            id: row.id,
            fileName: row.filename,
            description: row.description,
            authorId: row.author_id,
        }));

        res.json(images);
    } catch (err) {
        console.error("数据库错误:", err);
        res.status(500).json({ message: "服务器内部错误" });
    }
};