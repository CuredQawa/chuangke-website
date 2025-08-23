/**
 * 根据ID获取活动信息
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @returns {Object} 活动信息和作者信息
 */
export const getActivityById = async (req, res) => {
    // 从数据库中获取活动内容
    const query = 'SELECT title, content, datetime, author_id, cover_image_url FROM docs WHERE id = $1 AND category = $2';

    const result = await req.db.query(query, [req.params.id, "activity"]);
    if (result.rows.length === 0) {
        return res.status(404).json({ message: "活动不存在" });
    }

    // 获取作者信息
    const activity = result.rows[0];
    const authorQuery = 'SELECT username, graduation_year, email FROM accounts WHERE id = $1';
    const authorResult = await req.db.query(authorQuery, [activity.author_id]);

    const activityWithoutAuthorId = {
        title: activity.title,
        content: activity.content,
        datetime: activity.datetime,
        cover_image_url: activity.cover_image_url
    };

    res.json({
        ...activityWithoutAuthorId,
        author: authorResult.rows[0]
    });
};

/**
 * 获取所有活动列表
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @returns {Array} 活动列表
 */
export const getAllActivities = async (req, res) => {
    const query = 'SELECT id, title, datetime, author_id, cover_image_url FROM docs WHERE category = $1 ORDER BY datetime DESC';

    const result = await req.db.query(query, ["activity"]);

    // 为每个活动获取作者信息
    const activities = [];
    for (const row of result.rows) {
        const authorQuery = 'SELECT username, graduation_year, email FROM accounts WHERE id = $1';
        const authorResult = await req.db.query(authorQuery, [row.author_id]);

        const activityInfo = {
            id: row.id,
            title: row.title,
            datetime: row.datetime,
            cover_image_url: row.cover_image_url,
            author_id: row.author_id
        };

        activities.push({
            ...activityInfo,
            author: authorResult.rows[0]
        });
    }

    res.json(activities);
};

/**
 * 创建新活动
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @returns {Object} 创建成功消息
 */
export const newActivity = async (req, res) => {
    const { title, content, cover_image_url } = req.body;
    const authorID = req.user.id;

    const datetime = new Date();
    const query = 'INSERT INTO docs (title, content, datetime, author_id, category, cover_image_url) VALUES ($1, $2, $3, $4, $5, $6)';
    
    try {
        await req.db.query(query, [title, content, datetime, authorID, "activity", cover_image_url]);
        res.json({ message: "活动发布成功" });
    } catch (err) {
        console.error("数据库错误:", err);
        res.status(500).json({ message: "服务器内部错误" });
    }
};

/**
 * 编辑活动
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @returns {Object} 编辑成功消息
 */
export const editActivity = async (req, res) => {
    const activityID = req.params.id;
    const { title, content, cover_image_url } = req.body;
    const userID = req.user.id;
    const userRole = req.user.role;

    const activityQuery = 'SELECT id, author_id FROM docs WHERE id = $1 AND category = $2';
    const activityResult = await req.db.query(activityQuery, [activityID, "activity"]);

    if (activityResult.rows.length === 0) {
        return res.status(404).json({ message: "活动不存在" });
    }

    const activity = activityResult.rows[0];

    // 权限判断正确：管理员 or 自己
    if (userRole !== 'admin' && activity.author_id !== userID) {
        return res.status(403).json({ message: "权限不足，无法编辑此活动" });
    }

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
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @returns {Object} 删除成功消息
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

    const activity = activityResult.rows[0];

    // 权限判断正确
    if (userRole !== 'admin' && activity.author_id !== userID) {
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