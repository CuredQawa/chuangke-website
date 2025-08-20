export const getDocById = async (req, res, next) => {
    // 从数据库中获取文档内容
    const query = 'SELECT title, content, datetime, author_id FROM docs WHERE id = $1';

    const result = await req.db.query(query, [req.params.id]);
    if (result.rows.length === 0) {
        return res.status(404).json({ message: "文档不存在" });
    }

    res.json(result.rows[0]);
};

export const getAllDocs = async (req, res) => {
    const query = 'SELECT id, title, content, datetime, author_id FROM docs ORDER BY datetime DESC';

    const result = await req.db.query(query);

    res.json(result.rows);
};

export const newDoc = async (req, res) => {
    const { title, content } = req.body;
    const authorID = req.user.id;

    const datetime = new Date();
    const query = 'INSERT INTO docs (title, content, datetime, author_id) VALUES ($1, $2, $3, $4)';
    await req.db.query(query, [title, content, datetime, authorID]);

    res.json({ message: "文档发布成功" });
};

export const editDoc = async (req, res) => {
    const docID = req.params.id;
    const { title, content } = req.body;
    const userID = req.user.id;
    const userRole = req.user.role;

    // 检查文档是否存在以及用户是否有权限编辑
    const docQuery = 'SELECT id, author_id FROM docs WHERE id = $1';
    const docResult = await req.db.query(docQuery, [docID]);

    if (docResult.rows.length === 0) {
        return res.status(404).json({ message: "文档不存在" });
    }

    const doc = docResult.rows[0];

    // 检查权限：管理员可以编辑所有文档，普通用户只能编辑自己的文档
    if (userRole !== 'admin' && doc.author_id !== userID) {
        return res.status(403).json({ message: "权限不足，无法编辑此文档" });
    }

    const query = 'UPDATE docs SET title = $1, content = $2 WHERE id = $3';
    await req.db.query(query, [title, content, docID]);

    res.json({ message: "文档修改成功" });
};

export const deleteDoc = async (req, res) => {
    const docID = req.params.id;
    const userID = req.user.id;
    const userRole = req.user.role;

    // 检查文档是否存在以及用户是否有权限删除
    const docQuery = 'SELECT id, author_id FROM docs WHERE id = $1';
    const docResult = await req.db.query(docQuery, [docID]);

    if (docResult.rows.length === 0) {
        return res.status(404).json({ message: "文档不存在" });
    }

    const doc = docResult.rows[0];

    // 检查权限：管理员可以删除所有文档，普通用户只能删除自己的文档
    if (userRole !== 'admin' && doc.author_id !== userID) {
        return res.status(403).json({ message: "权限不足，无法删除此文档" });
    }

    const query = 'DELETE FROM docs WHERE id = $1';
    await req.db.query(query, [docID]);

    res.json({ message: "文档删除成功" });
};