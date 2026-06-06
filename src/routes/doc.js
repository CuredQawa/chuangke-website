/**
 * 文档路由
 * 提供文档信息的查询、创建、编辑和删除
 */

import { validateAndSanitizeContent } from '../middleware/content-validators.js';

/**
 * 根据ID获取文档信息
 * @param {Object} req
 * @param {Object} res
 */
export const getDocById = async (req, res) => {
    const query = 'SELECT title, content, datetime, author_id, cover_image_url FROM docs WHERE id = $1 AND category = $2';

    try {
        const result = await req.db.query(query, [req.params.id, "doc"]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "文档不存在" });
        }

        const doc = result.rows[0];
        const authorResult = await req.db.query(
            'SELECT username, graduation_year, email FROM accounts WHERE id = $1',
            [doc.author_id]
        );

        res.json({
            title: doc.title,
            content: doc.content,
            datetime: doc.datetime,
            cover_image_url: doc.cover_image_url,
            author: authorResult.rows[0]
        });
    } catch (err) {
        console.error("数据库错误:", err);
        res.status(500).json({ message: "服务器内部错误" });
    }
};

/**
 * 获取所有文档列表（JOIN 一次查询，避免 N+1）
 */
export const getAllDocs = async (req, res) => {
    const query = `
        SELECT d.id, d.title, d.datetime, d.author_id, d.cover_image_url,
               a.username, a.graduation_year, a.email
        FROM docs d
        LEFT JOIN accounts a ON d.author_id = a.id
        WHERE d.category = $1
        ORDER BY d.datetime DESC
    `;

    try {
        const result = await req.db.query(query, ["doc"]);
        const docs = result.rows.map(row => ({
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
        res.json(docs);
    } catch (err) {
        console.error("数据库错误:", err);
        res.status(500).json({ message: "服务器内部错误" });
    }
};

/**
 * 创建新文档
 */
export const newDoc = async (req, res) => {
    const validated = validateAndSanitizeContent(req.body);
    if (validated.error) {
        return res.status(validated.error.status).json({ message: validated.error.message });
    }
    const { title, content, cover_image_url } = validated.data;
    const authorID = req.user.id;
    const datetime = new Date();

    const query = 'INSERT INTO docs (title, content, datetime, author_id, category, cover_image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, title, content, datetime, author_id, cover_image_url';

    try {
        const result = await req.db.query(query, [title, content, datetime, authorID, "doc", cover_image_url]);
        const doc = result.rows[0];
        const authorResult = await req.db.query(
            'SELECT username, graduation_year, email FROM accounts WHERE id = $1',
            [authorID]
        );
        res.json({ ...doc, author: authorResult.rows[0] });
    } catch (err) {
        console.error("数据库错误:", err);
        res.status(500).json({ message: "服务器内部错误" });
    }
};

/**
 * 编辑文档
 */
export const editDoc = async (req, res) => {
    const docID = req.params.id;
    const userID = req.user.id;
    const userRole = req.user.role;

    const docQuery = 'SELECT id, author_id FROM docs WHERE id = $1 AND category = $2';
    const docResult = await req.db.query(docQuery, [docID, "doc"]);

    if (docResult.rows.length === 0) {
        return res.status(404).json({ message: "文档不存在" });
    }

    if (userRole !== 'admin' && docResult.rows[0].author_id !== userID) {
        return res.status(403).json({ message: "权限不足，无法编辑此文档" });
    }

    const validated = validateAndSanitizeContent(req.body);
    if (validated.error) {
        return res.status(validated.error.status).json({ message: validated.error.message });
    }
    const { title, content, cover_image_url } = validated.data;

    const query = 'UPDATE docs SET title = $1, content = $2, cover_image_url = $3 WHERE id = $4 AND category = $5';

    try {
        await req.db.query(query, [title, content, cover_image_url, docID, "doc"]);
        res.json({ message: "文档修改成功" });
    } catch (err) {
        console.error("数据库错误:", err);
        res.status(500).json({ message: "服务器内部错误" });
    }
};

/**
 * 删除文档
 */
export const deleteDoc = async (req, res) => {
    const docID = req.params.id;
    const userID = req.user.id;
    const userRole = req.user.role;

    const docQuery = 'SELECT id, author_id FROM docs WHERE id = $1 AND category = $2';
    const docResult = await req.db.query(docQuery, [docID, "doc"]);

    if (docResult.rows.length === 0) {
        return res.status(404).json({ message: "文档不存在" });
    }

    if (userRole !== 'admin' && docResult.rows[0].author_id !== userID) {
        return res.status(403).json({ message: "权限不足，无法删除此文档" });
    }

    const query = 'DELETE FROM docs WHERE id = $1 AND category = $2';

    try {
        await req.db.query(query, [docID, "doc"]);
        res.json({ message: "文档删除成功" });
    } catch (err) {
        console.error("数据库错误:", err);
        res.status(500).json({ message: "服务器内部错误" });
    }
};
