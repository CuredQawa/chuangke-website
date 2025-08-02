const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const marked = require('marked');

// 首页路由：返回主页 HTML 文件
router.get('/', (req, res) => {
    // res.sendFile(path.join(__dirname, 'public', 'html', 'home.html'));
    res.redirect(301,'/html/home.html')
});

// 获取所有公告 API
router.get('/api/announcements', (req, res) => {
    const filePath = path.join(__dirname, 'data', 'announcements.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('无法读取公告数据');
        }
        res.header('Content-Type', 'application/json');
        res.send(data);
    });
});

// 新增公告 API
router.post('/api/announcements', (req, res) => {
    const filePathAnnouncements = path.join(__dirname, 'data', 'announcements.json');
    const filePathAdmins = path.join(__dirname, 'data', 'admins.json');

    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        try {
            const newAnnouncement = JSON.parse(body);

            // 校验字段
            const { title, content, administrator, key } = newAnnouncement;
            if (!title || !content || !administrator || !key) {
                return res.status(400).send(JSON.stringify({ success: false, message: '缺少必要字段' }));
            }

            // 读取管理员列表
            fs.readFile(filePathAdmins, 'utf8', (err, adminData) => {
                if (err) {
                    return res.status(500).send(JSON.stringify({ success: false, message: '无法读取管理员数据' }));
                }

                const admins = JSON.parse(adminData);
                // 验证管理员是否存在且密钥正确
                if (!admins[administrator] || admins[administrator] !== key) {
                    return res.status(401).send(JSON.stringify({ success: false, message: '管理员验证失败' }));
                }

                // 构建新公告对象
                const announcementToAdd = {
                    title,
                    content,
                    administrator,
                    date: new Date().toISOString().split('T')[0] // yyyy-mm-dd
                };

                // 读取现有公告并添加新公告
                fs.readFile(filePathAnnouncements, 'utf8', (err, annData) => {
                    if (err) {
                        return res.status(500).send(JSON.stringify({ success: false, message: '无法读取公告数据' }));
                    }

                    const announcements = JSON.parse(annData);
                    announcements.push(announcementToAdd);

                    // 写入更新后的公告文件
                    fs.writeFile(filePathAnnouncements, JSON.stringify(announcements, null, 2), 'utf8', (err) => {
                        if (err) {
                            return res.status(500).send(JSON.stringify({ success: false, message: '无法写入公告数据' }));
                        }

                        res.send(JSON.stringify({ success: true }));
                    });
                });
            });
        } catch (e) {
            res.status(400).send(JSON.stringify({ success: false, message: 'JSON 格式错误' }));
        }
    });
});

// 获取文档内容 API
router.get('/api/docs/*path', (req, res) => {

    // 构建 .md 文件的完整路径
    const filePath = path.join(__dirname, './public/documents', req.params.path + '.md');

    //空值判断
    if (!req.params.path) {
        return res.status(400).send('请指定文档路径');
    }

    // 读取文件
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                return res.status(404).send('文档不存在');
            } else {
                console.error('文件读取错误:', err);
                return res.status(500).send('服务器内部错误');
            }
        }

        // 返回 Markdown 内容
        // res.type('text/plain; charset=utf-8');
        // res.send(data);
        // 转化为 HTML 再返回
        res.header('Content-Type', 'text/html; charset=utf-8');
        res.send(marked.parse(data)); // 将 Markdown 转为 HTML
    });
});




// API：获取所有文档列表（自动扫描 + 提取标题）
router.get('/api/docs-list', (req, res) => {
    // 指向 public/documents 目录
    const docsDir = path.join(__dirname, '.', 'public', 'documents');

    fs.readdir(docsDir, (err, files) => {
        if (err) {
            console.error('读取文档目录失败:', err);
            return res.status(500).json([]);
        }

        // 过滤出 .md 文件
        const markdownFiles = files.filter(file => 
            path.extname(file).toLowerCase() === '.md'
        );

        const result = [];

        markdownFiles.forEach(file => {
            const filePath = path.join(docsDir, file);
            const fileNameWithoutExt = path.basename(file, '.md');

            // 读取文件内容，尝试提取 # 标题
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                const titleMatch = content.trim().match(/^#\s+(.+)$/m);
                const title = titleMatch ? titleMatch[1].trim() : fileNameWithoutExt;

                result.push({
                    path: fileNameWithoutExt,  // 用于请求 /api/docs/xxx
                    title: title               // 显示在菜单上
                });
            } catch (readErr) {
                // 如果读取失败，只用文件名
                result.push({
                    path: fileNameWithoutExt,
                    title: fileNameWithoutExt
                });
            }
        });

        // 按标题排序（可选）
        result.sort((a, b) => a.title.localeCompare(b.title));

        res.json(result);
    });
});


module.exports = router;