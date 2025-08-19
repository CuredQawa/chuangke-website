import express from 'express';

const router = express.Router();

// 首页路由：返回主页 HTML 文件
router.get('/', (_, res) => {
    res.redirect(301, '/html/home.html')
});

// 获取所有公告
router.get('/api/announcements', async (req, res) => {
    const query = 'SELECT id, title, content, datetime, author_id FROM announcements ORDER BY datetime DESC';

    await req.db.query(query, (err, result) => {
        if (err) {
            console.error('查询公告失败:', err);
            return res.status(500).send('无法读取公告数据');
        }
        res.json(result.rows);
    });
});

// 新增公告
// TODO
router.post('/api/announcements', (req, res) => {
    const content = req.body.content;
    const author_id = req.body.author_id;
    // TODO： JWT
});

// 获取文档内容
router.get('/api/docs/:id', async (req, res) => {
    // 从数据库中获取文档内容
    const query = 'SELECT title, content, datetime, author_id FROM docs WHERE id = $1 ORDER BY datetime DESC';

    // TODO: 错误处理&在客户端渲染markdown
    // TODO: 显示作者
    try {
        const result = await req.db.query(query, [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).send('文档不存在');
        } else {
            res.json(result.rows[0]);
        }
    } catch (err) {
        console.error('查询文档失败:', err);
        return res.status(500).send('无法读取文档数据'); // TODO：错误处理
    }
});

// 获取所有文档列表
router.get('/api/docs', async (req, res) => {
    const query = 'SELECT id, title, content, datetime, author_id FROM docs ORDER BY datetime DESC';

    await req.db.query(query, (err, result) => {
        if (err) {
            console.error('查询文档失败:', err);
            return res.status(500).send('无法读取文档数据');
        }
        res.json(result.rows);
    });
});

export default router;