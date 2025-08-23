/**
 * 根据ID获取项目信息
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @returns {Object} 项目信息和作者信息
 */
export const getProjectById = async (req, res) => {
    // 从数据库中获取项目内容
    const query = 'SELECT title, content, datetime, author_id, cover_image_filename FROM docs WHERE id = $1 AND category = $2';

    const result = await req.db.query(query, [req.params.id, "project"]);
    if (result.rows.length === 0) {
        return res.status(404).json({ message: "项目不存在" });
    }

    // 获取作者信息
    const project = result.rows[0];
    const authorQuery = 'SELECT username, graduation_year, email FROM accounts WHERE id = $1';
    const authorResult = await req.db.query(authorQuery, [project.author_id]);

    const projectWithoutAuthorId = {
        title: project.title,
        content: project.content,
        datetime: project.datetime,
        cover_image_filename: project.cover_image_filename
    };

    res.json({
        ...projectWithoutAuthorId,
        author: authorResult.rows[0]
    });
};

/**
 * 获取所有项目列表
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @returns {Array} 项目列表
 */
export const getAllProjects = async (req, res) => {
    const query = 'SELECT id, title, datetime, author_id, cover_image_filename FROM docs WHERE category = $1 ORDER BY datetime DESC';

    const result = await req.db.query(query, ["project"]);

    // 为每个项目获取作者信息
    const projects = [];
    for (const row of result.rows) {
        const authorQuery = 'SELECT username, graduation_year, email FROM accounts WHERE id = $1';
        const authorResult = await req.db.query(authorQuery, [row.author_id]);

        const projectInfo = {
            id: row.id,
            title: row.title,
            datetime: row.datetime,
            cover_image_filename: row.cover_image_filename,
            author_id: row.author_id
        };

        projects.push({
            ...projectInfo,
            author: authorResult.rows[0]
        });
    }

    res.json(projects);
};

/**
 * 创建新项目
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @returns {Object} 创建成功消息
 */
export const newProject = async (req, res) => {
    const { title, content, cover_image_filename } = req.body;
    const authorID = req.user.id;

    const datetime = new Date();
    const query = 'INSERT INTO docs (title, content, datetime, author_id, category, cover_image_filename) VALUES ($1, $2, $3, $4, $5, $6)';
    
    try {
        await req.db.query(query, [title, content, datetime, authorID, "project", cover_image_filename]);
        res.json({ message: "项目发布成功" });
    } catch (err) {
        console.error("数据库错误:", err);
        res.status(500).json({ message: "服务器内部错误" });
    }
};

/**
 * 编辑项目
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @returns {Object} 编辑成功消息
 */
export const editProject = async (req, res) => {
    const projectID = req.params.id;
    const { title, content, cover_image_filename } = req.body;
    const userID = req.user.id;
    const userRole = req.user.role;

    const projectQuery = 'SELECT id, author_id FROM docs WHERE id = $1 AND category = $2';
    const projectResult = await req.db.query(projectQuery, [projectID, "project"]);

    if (projectResult.rows.length === 0) {
        return res.status(404).json({ message: "项目不存在" });
    }

    const project = projectResult.rows[0];

    // 权限判断正确：管理员 or 自己
    if (userRole !== 'admin' && project.author_id !== userID) {
        return res.status(403).json({ message: "权限不足，无法编辑此项目" });
    }

    const query = 'UPDATE docs SET title = $1, content = $2, cover_image_filename = $3 WHERE id = $4 AND category = $5';
    
    try {
        await req.db.query(query, [title, content, cover_image_filename, projectID, "project"]);
        res.json({ message: "项目修改成功" });
    } catch (err) {
        console.error("数据库错误:", err);
        res.status(500).json({ message: "服务器内部错误" });
    }
};

/**
 * 删除项目
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @returns {Object} 删除成功消息
 */
export const deleteProject = async (req, res) => {
    const projectID = req.params.id;
    const userID = req.user.id;
    const userRole = req.user.role;

    const projectQuery = 'SELECT id, author_id FROM docs WHERE id = $1 AND category = $2';
    const projectResult = await req.db.query(projectQuery, [projectID, "project"]);

    if (projectResult.rows.length === 0) {
        return res.status(404).json({ message: "项目不存在" });
    }

    const project = projectResult.rows[0];

    // 权限判断正确
    if (userRole !== 'admin' && project.author_id !== userID) {
        return res.status(403).json({ message: "权限不足，无法删除此项目" });
    }

    const query = 'DELETE FROM docs WHERE id = $1 AND category = $2';
    
    try {
        await req.db.query(query, [projectID, "project"]);
        res.json({ message: "项目删除成功" });
    } catch (err) {
        console.error("数据库错误:", err);
        res.status(500).json({ message: "服务器内部错误" });
    }
};