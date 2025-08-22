export const getDocById = async (req, res) => {
    // 从数据库中获取文档内容
    const query = 'SELECT title, content, datetime, author_id FROM docs WHERE id = $1';

    const result = await req.db.query(query, [req.params.id]);
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

export const getAllDocs = async (req, res) => {
    const query = 'SELECT id, title, content, datetime, author_id FROM docs ORDER BY datetime DESC';

    const result = await req.db.query(query);

    // 为每个文档获取作者信息
    const docs = [];
    for (const row of result.rows) {
        const authorQuery = 'SELECT username, graduation_year, email FROM accounts WHERE id = $1';
        const authorResult = await req.db.query(authorQuery, [row.author_id]);

        const docInfo = {
            id: row.id,
            title: row.title,
            content: row.content,
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

    const docQuery = 'SELECT id, author_id FROM docs WHERE id = $1';
    const docResult = await req.db.query(docQuery, [docID]);

    if (docResult.rows.length === 0) {
        return res.status(404).json({ message: "文档不存在" });
    }

    const doc = docResult.rows[0];

    // 权限判断正确：管理员 or 自己
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

    const docQuery = 'SELECT id, author_id FROM docs WHERE id = $1';
    const docResult = await req.db.query(docQuery, [docID]);

    if (docResult.rows.length === 0) {
        return res.status(404).json({ message: "文档不存在" });
    }

    const doc = docResult.rows[0];

    // 权限判断正确
    if (userRole !== 'admin' && doc.author_id !== userID) {
        return res.status(403).json({ message: "权限不足，无法删除此文档" });
    }

    const query = 'DELETE FROM docs WHERE id = $1';
    await req.db.query(query, [docID]);

    res.json({ message: "文档删除成功" });
};