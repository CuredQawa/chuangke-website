const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

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

module.exports = router;