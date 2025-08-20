export const getAllAnnouncements = async (req, res) => {
    const query = 'SELECT id, title, content, datetime, author_id FROM announcements ORDER BY datetime DESC';

    const result = await req.db.query(query);
    res.json(result.rows);
};