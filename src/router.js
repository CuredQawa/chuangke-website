import express from 'express';
import { getAllAnnouncements } from './routes/announcements.js';
import { getDocById, getAllDocs } from './routes/docs.js';
import { login } from './routes/login.js';
import { register } from './routes/register.js';
import { userAuth } from './middleware/auth.js';
import { adminAuth } from './middleware/auth.js';
import { getAllAccounts } from './routes/account.js';

const router = express.Router();

// 返回首页 HTML 文件
router.get('/', (_, res) => {
    res.redirect(301, '/html/home.html')
});

// 获取所有公告
router.get('/api/announcements', getAllAnnouncements);

// 获取文档内容
router.get('/api/doc/:id', getDocById);

// 获取所有文档列表
router.get('/api/docs', getAllDocs);

// 登录
router.post('/api/login', login);

// 注册
router.post('/api/register', register);

// 获取所有用户（管理员）
router.get('/api/accounts', adminAuth, getAllAccounts);

export default router;