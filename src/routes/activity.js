/**
 * 活动路由
 * 提供活动信息的查询、创建、编辑和删除
 */

import { validateAndSanitizeContent } from '../middleware/content-validators.js';

/**
 * 根据ID获取活动信息
 */
export const getActivityById = async (req, res) => {
    const query = 'SELECT title, content, datetime, author_id, cover_image_url FROM docs WHERE id = $1 AND category = $2';

    try {
        const result = await req.db.query(query, [req.params.id, "activity"]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "活动不存在" });
        }

        const activity = result.rows[0];
        const authorResult = await req.db.query(
            'SELECT username, graduation_year, email FROM accounts WHERE id = $1',
            [activity.author_id]
        );

        res.json({
            title: activity.title,
            content: activity.content,
            datetime: activity.datetime,
            cover_image_url: activity.cover_image_url,
            author: authorResult.rows[0]
        });
    } catch (err) {
        console.error("数据库错误:", err);
        res.status(500).json({ message: "服务器内部错误" });
    }
};

/**
 * 获取所有活动列表（JOIN 一次查询，避免 N+1）
 */
export const getAllActivities = async (req, res) => {
    const query = `
        SELECT d.id, d.title, d.datetime, d.author_id, d.cover_image_url,
               a.username, a.graduation_year, a.email
        FROM docs d
        LEFT JOIN accounts a ON d.author_id = a.id
        WHERE d.category = $1
        ORDER BY d.datetime DESC
    `;

    try {
        const result = await req.db.query(query, ["activity"]);
        const activities = result.rows.map(row => ({
            id: row.id,
            title: row.title,
            datetime: row.datetime,
            cover_image_url: row.cover_image_url,
            author_id: row.author_id,
            author: {
                username: row.username,
                graduation_year: row.graduation_year,
                email: row.email
            }
        }));
        res.json(activities);
    } catch (err) {
        console.error("数据库错误:", err);
        res.status(500).json({ message: "服务器内部错误" });
    }
};

/**
 * 创建新活动
 */
export const newActivity = async (req, res) => {
    const validated = validateAndSanitizeContent(req.body);
    if (validated.error) {
        return res.status(validated.error.status).json({ message: validated.error.message });
    }
    const { title, content, cover_image_url } = validated.data;
    const authorID = req.user.id;
    const datetime = new Date();

    const query = 'INSERT INTO docs (title, content, datetime, author_id, category, cover_image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, title, content, datetime, author_id, cover_image_url';
    try {
        const result = await req.db.query(query, [title, content, datetime, authorID, "activity", cover_image_url]);
        const activity = result.rows[0];
        const authorResult = await req.db.query(
            'SELECT username, graduation_year, email FROM accounts WHERE id = $1',
            [authorID]
        );
        res.json({ ...activity, author: authorResult.rows[0] });
    } catch (err) {
        console.error("数据库错误:", err);
        res.status(500).json({ message: "服务器内部错误" });
    }
};

/**
 * 编辑活动
 */
export const editActivity = async (req, res) => {
    const activityID = req.params.id;
    const userID = req.user.id;
    const userRole = req.user.role;

    const activityQuery = 'SELECT id, author_id FROM docs WHERE id = $1 AND category = $2';
    const activityResult = await req.db.query(activityQuery, [activityID, "activity"]);

    if (activityResult.rows.length === 0) {
        return res.status(404).json({ message: "活动不存在" });
    }

    if (userRole !== 'admin' && activityResult.rows[0].author_id !== userID) {
        return res.status(403).json({ message: "权限不足，无法编辑此活动" });
    }

    const validated = validateAndSanitizeContent(req.body);
    if (validated.error) {
        return res.status(validated.error.status).json({ message: validated.error.message });
    }
    const { title, content, cover_image_url } = validated.data;

    const query = 'UPDATE docs SET title = $1, content = $2, cover_image_url = $3 WHERE id = $4 AND category = $5';
    try {
        await req.db.query(query, [title, content, cover_image_url, activityID, "activity"]);
        res.json({ message: "活动修改成功" });
    } catch (err) {
        console.error("数据库错误:", err);
        res.status(500).json({ message: "服务器内部错误" });
    }
};

/**
 * 删除活动
 */
export const deleteActivity = async (req, res) => {
    const activityID = req.params.id;
    const userID = req.user.id;
    const userRole = req.user.role;

    const activityQuery = 'SELECT id, author_id FROM docs WHERE id = $1 AND category = $2';
    const activityResult = await req.db.query(activityQuery, [activityID, "activity"]);

    if (activityResult.rows.length === 0) {
        return res.status(404).json({ message: "活动不存在" });
    }

    if (userRole !== 'admin' && activityResult.rows[0].author_id !== userID) {
        return res.status(403).json({ message: "权限不足，无法删除此活动" });
    }

    const query = 'DELETE FROM docs WHERE id = $1 AND category = $2';

    try {
        await req.db.query(query, [activityID, "activity"]);
        res.json({ message: "活动删除成功" });
    } catch (err) {
        console.error("数据库错误:", err);
        res.status(500).json({ message: "服务器内部错误" });
    }
};
