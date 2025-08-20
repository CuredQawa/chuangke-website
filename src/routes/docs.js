export const getDocById = async (req, res, next) => {
    // 从数据库中获取文档内容
    const query = 'SELECT title, content, datetime, author_id FROM docs WHERE id = $1';

    const result = await req.db.query(query, [req.params.id]);
    if (result.rows.length === 0) {
        return res.status(404).json(
            {
                message: '文档不存在'
            }
        );
    }

    res.json(result.rows[0]);
};
export const getAllDocs = async (req, res) => {
    const query = 'SELECT id, title, datetime, author_id FROM docs ORDER BY datetime DESC';

    const result = await req.db.query(query);
    res.json(result.rows);
};