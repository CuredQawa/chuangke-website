export const getAllAnnouncements = async (req, res) => {
    const query = 'SELECT id, title, content, datetime, author_id FROM announcements ORDER BY datetime DESC';

    const result = await req.db.query(query);
    res.json(result.rows);
};

export const newAnnouncement = async (req, res) => {
    const { title, content } = req.body;
    const authorID = req.user.id;

    const query = 'INSERT INTO announcements (title, content, datetime, author_id) VALUES ($1, $2, $3, $4) RETURNING id';

    const datetime = new Date();
    await req.db.query(query, [title, content, datetime, authorID]);
    res.json({ message: '公告发布成功' });
};

export const editAnnouncement = async (req, res) => {
    const { title, content } = req.body;

    const query = 'UPDATE announcements SET title = $1, content = $2 WHERE id = $3';

    const result = await req.db.query(query, [title, content, req.params.id]);
    if (result.rowCount === 0) {
        return res.status(404).json(
            { message: '公告不存在' }
        )
    } else {
        res.json({ message: '更新成功' });
    }
}

export const deleteAnnouncement = async (req, res) => {
    const query = 'DELETE FROM announcements WHERE id = $1';

    const result = await req.db.query(query, [req.params.id]);
    if (result.rowCount === 0) {
        return res.status(404).json(
            { message: '公告不存在' }
        )
    }

    res.json({ message: '删除成功' })
}