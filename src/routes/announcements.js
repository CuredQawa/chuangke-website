/**
 * 公告管理路由
 * 提供公告信息查询、创建、编辑和删除功能
 */

import { validateAndSanitizeAnnouncement } from '../middleware/content-validators.js';

/**
 * 获取所有公告（JOIN 一次查询，避免 N+1）
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
export const getAllAnnouncements = async (req, res) => {
    const query = `
        SELECT n.id, n.title, n.content, n.datetime, n.author_id,
               a.username, a.graduation_year, a.email
        FROM announcements n
        LEFT JOIN accounts a ON n.author_id = a.id
        ORDER BY n.datetime DESC
    `;

    try {
        const result = await req.db.query(query);
        const announcements = result.rows.map(row => ({
            id: row.id,
            title: row.title,
            content: row.content,
            datetime: row.datetime,
            author: {
                username: row.username,
                graduation_year: row.graduation_year,
                email: row.email
            }
        }));
        res.json(announcements);
    } catch (err) {
        console.error("数据库错误:", err);
        res.status(500).json({ message: "服务器内部错误" });
    }
};

/**
 * 创建新公告
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
export const newAnnouncement = async (req, res) => {
    const validated = validateAndSanitizeAnnouncement(req.body);
    if (validated.error) {
        return res.status(validated.error.status).json({ message: validated.error.message });
    }
    const { title, content } = validated.data;
    const authorID = req.user.id;

    const query = 'INSERT INTO announcements (title, content, datetime, author_id) VALUES ($1, $2, $3, $4) RETURNING id, title, content, datetime, author_id';

    try {
        const datetime = new Date();
        const result = await req.db.query(query, [title, content, datetime, authorID]);
        const announcement = result.rows[0];

        // 同时返回作者信息，前端可直接展示
        const authorResult = await req.db.query(
            'SELECT username, graduation_year, email FROM accounts WHERE id = $1',
            [authorID]
        );

        res.json({
            ...announcement,
            author: authorResult.rows[0]
        });
    } catch (err) {
        console.error("数据库错误:", err);
        res.status(500).json({ message: "服务器内部错误" });
    }
};

/**
 * 编辑公告
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
export const editAnnouncement = async (req, res) => {
    const validated = validateAndSanitizeAnnouncement(req.body);
    if (validated.error) {
        return res.status(validated.error.status).json({ message: validated.error.message });
    }
    const { title, content } = validated.data;

    const query = 'UPDATE announcements SET title = $1, content = $2 WHERE id = $3';

    try {
        const result = await req.db.query(query, [title, content, req.params.id]);
        if (result.rowCount === 0) {
            return res.status(404).json(
                { message: '公告不存在' }
            )
        } else {
            res.json({ message: '更新成功' });
        }
    } catch (err) {
        console.error("数据库错误:", err);
        res.status(500).json({ message: "服务器内部错误" });
    }
}

/**
 * 删除公告
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
export const deleteAnnouncement = async (req, res) => {
    const query = 'DELETE FROM announcements WHERE id = $1';

    try {
        const result = await req.db.query(query, [req.params.id]);
        if (result.rowCount === 0) {
            return res.status(404).json(
                { message: '公告不存在' }
            )
        }

        res.json({ message: '删除成功' })
    } catch (err) {
        console.error("数据库错误:", err);
        res.status(500).json({ message: "服务器内部错误" });
    }
}