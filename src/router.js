/**
 * 应用程序路由配置文件
 * 配置所有API端点和对应的处理函数
 */

import express from 'express';
import { getAllAnnouncements, newAnnouncement, deleteAnnouncement, editAnnouncement } from './routes/announcements.js';
import { getDocById, getAllDocs, newDoc, deleteDoc, editDoc } from './routes/doc.js';
import { getProjectById, getAllProjects, newProject, deleteProject, editProject } from './routes/project.js';
import { getActivityById, getAllActivities, newActivity, deleteActivity, editActivity } from './routes/activity.js';
import { login, logout } from './routes/login.js';
import { register } from './routes/register.js';
import { userAuth, adminAuth } from './middleware/auth.js';
import { uploadImageMiddleware } from './middleware/upload-image.js';
import { getAccountInfo, getAllAccounts, deleteAccount, editAccount } from './routes/account.js';
import { uploadImage, deleteImage, getAllImages } from './routes/image.js';

const router = express.Router();

// 返回首页 HTML 文件
router.get('/', (_, res) => {
    res.redirect(301, '/html/index.html')
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

// 获取项目内容
router.get('/api/project/:id', getProjectById);

// 获取所有项目列表
router.get('/api/projects', getAllProjects);

// 新增项目
router.post('/api/project', userAuth, newProject);

// 编辑项目
router.put('/api/project/:id', userAuth, editProject);

// 删除项目
router.delete('/api/project/:id', userAuth, deleteProject);

// --------------------

// 获取活动内容
router.get('/api/activity/:id', getActivityById);

// 获取所有活动列表
router.get('/api/activities', getAllActivities);

// 新增活动
router.post('/api/activity', userAuth, newActivity);

// 编辑活动
router.put('/api/activity/:id', userAuth, editActivity);

// 删除活动
router.delete('/api/activity/:id', userAuth, deleteActivity);

// --------------------

// 上传图片
router.post('/api/image', userAuth, uploadImageMiddleware, uploadImage);

// 删除图片
router.delete('/api/image/:id', userAuth, deleteImage);

// 获取所有图片
router.get('/api/images', getAllImages);

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