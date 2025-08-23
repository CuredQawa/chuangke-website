/**
 * 根据ID获取文档信息
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @returns {Object} 文档信息和作者信息
 */
export const getDocById = async (req, res) => {
    // 从数据库中获取文档内容
    const query = 'SELECT title, content, datetime, author_id FROM docs WHERE id = $1 AND category = $2';

    const result = await req.db.query(query, [req.params.id, "doc"]);
    if (result.rows.length === 0) {
        return res.status(404).json({ message: "文档不存在" });
    }

    // 获取作者信息
    const doc = result.rows[0];
    const authorQuery = 'SELECT username, graduation_year, email FROM accounts WHERE id = $1';
    const authorResult = await req.db.query(authorQuery, [doc.author_id]);

    const docWithoutAuthorId = {
        title: doc.title,
        content: doc.content,
        datetime: doc.datetime
    };

    res.json({
        ...docWithoutAuthorId,
        author: authorResult.rows[0]
    });
};

/**
 * 获取所有文档列表
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @returns {Array} 文档列表
 */
export const getAllDocs = async (req, res) => {
    const query = 'SELECT id, title, datetime, author_id FROM docs WHERE category = $1 ORDER BY datetime DESC';

    const result = await req.db.query(query, ["doc"]);

    // 为每个文档获取作者信息
    const docs = [];
    for (const row of result.rows) {
        const authorQuery = 'SELECT username, graduation_year, email FROM accounts WHERE id = $1';
        const authorResult = await req.db.query(authorQuery, [row.author_id]);

        const docInfo = {
            id: row.id,
            title: row.title,
            datetime: row.datetime,
            author_id: row.author_id
        };

        docs.push({
            ...docInfo,
            author: authorResult.rows[0]
        });
    }

    res.json(docs);
};

/**
 * 创建新文档
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @returns {Object} 创建成功消息
 */
export const newDoc = async (req, res) => {
    const { title, content } = req.body;
    const authorID = req.user.id;

    const datetime = new Date();
    const query = 'INSERT INTO docs (title, content, datetime, author_id, category) VALUES ($1, $2, $3, $4, $5)';
    
    try {
        await req.db.query(query, [title, content, datetime, authorID, "doc"]);
        res.json({ message: "文档发布成功" });
    } catch (err) {
        console.error("数据库错误:", err);
        res.status(500).json({ message: "服务器内部错误" });
    }
};

/**
 * 编辑文档
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @returns {Object} 编辑成功消息
 */
export const editDoc = async (req, res) => {
    const docID = req.params.id;
    const { title, content } = req.body;
    const userID = req.user.id;
    const userRole = req.user.role;

    const docQuery = 'SELECT id, author_id FROM docs WHERE id = $1 AND category = $2';
    const docResult = await req.db.query(docQuery, [docID, "doc"]);

    if (docResult.rows.length === 0) {
        return res.status(404).json({ message: "文档不存在" });
    }

    const doc = docResult.rows[0];

    // 权限判断正确：管理员 or 自己
    if (userRole !== 'admin' && doc.author_id !== userID) {
        return res.status(403).json({ message: "权限不足，无法编辑此文档" });
    }

    const query = 'UPDATE docs SET title = $1, content = $2 WHERE id = $3 AND category = $4';
    
    try {
        await req.db.query(query, [title, content, docID, "doc"]);
        res.json({ message: "文档修改成功" });
    } catch (err) {
        console.error("数据库错误:", err);
        res.status(500).json({ message: "服务器内部错误" });
    }
};

/**
 * 删除文档
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @returns {Object} 删除成功消息
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

    const doc = docResult.rows[0];

    // 权限判断正确
    if (userRole !== 'admin' && doc.author_id !== userID) {
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