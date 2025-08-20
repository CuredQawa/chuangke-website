export const getAllAccounts = async (req, res) => {
    const db = req.db;
    const result = await db.query('SELECT id, username, graduation_year, email, role FROM accounts');
    res.json(result.rows);
}