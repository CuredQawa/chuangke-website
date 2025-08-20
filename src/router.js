import express from 'express';
import { getAllAnnouncements, newAnnouncement, deleteAnnouncement, editAnnouncement } from './routes/announcements.js';
import { getDocById, getAllDocs, newDoc, deleteDoc, editDoc } from './routes/docs.js';
import { login, logout } from './routes/login.js';
import { register } from './routes/register.js';
import { userAuth, adminAuth } from './middleware/auth.js';
import { getAccountInfo, getAllAccounts, deleteAccount, editAccount } from './routes/account.js';

const router = express.Router();

// 返回首页 HTML 文件
router.get('/', (_, res) => {
    res.redirect(301, '/html/home.html')
});

// --------------------

// 获取所有公告
router.get('/api/announcements', getAllAnnouncements);

// 新增公告（管理员）
router.post('/api/announcement', adminAuth, newAnnouncement);

// 编辑公告（管理员）
router.put('/api/announcement/:id', adminAuth, editAnnouncement);

// 删除公告（管理员）
router.delete('/api/announcement/:id', adminAuth, deleteAnnouncement);

// --------------------

// 获取文档内容
router.get('/api/doc/:id', getDocById);

// 获取所有文档列表
router.get('/api/docs', getAllDocs);

// 新增文档
router.post('/api/doc', userAuth, newDoc);

// 编辑文档
router.put('/api/doc/:id', userAuth, editDoc);

// 删除文档
router.delete('/api/doc/:id', userAuth, deleteDoc);

// --------------------

// 登录
router.post('/api/login', login);

// 登出
router.get('/api/logout', userAuth, logout);

// 注册（管理员）
router.post('/api/register', adminAuth, register);

// --------------------

// 获取所有账户（管理员）
router.get('/api/accounts', adminAuth, getAllAccounts);

// 获取当前登录的账户信息
router.get('/api/account', userAuth, getAccountInfo);

// 编辑账户信息（管理员）
router.put('/api/account/:id', adminAuth, editAccount);

// 删除账户（管理员）
router.delete('/api/account/:id', adminAuth, deleteAccount);

export default router;