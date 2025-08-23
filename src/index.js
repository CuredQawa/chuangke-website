/**
 * 应用程序入口文件
 * 设置Express服务器并启动监听
 */

import express from 'express';
import router from './router.js'
import dbMiddleware from './middleware/database.js';
import cookieParser from 'cookie-parser';
import { RUNNING_PORT } from './constants.js';

const app = express();

app.use(express.json());
app.use(dbMiddleware);
app.use(express.static("public"));
// Cookies 解析
app.use(cookieParser());
app.use("/", router);

/**
 * 启动服务器并监听指定端口
 */
app.listen(RUNNING_PORT, () => {
    console.log(`Running on localhost:${RUNNING_PORT}`);
})

// TODO 编辑账户页面