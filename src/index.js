import express from 'express';
import router from './router.js'
import dbMiddleware from './middleware/database.js';
import errorHandler from './middleware/error-handler.js';
import cookieParser from 'cookie-parser';

const app = express();

// 中间件
app.use(express.json());
app.use(dbMiddleware);
app.use(express.static("public"));
// Cookies 解析
app.use(cookieParser());
// app.use(express.urlencoded({ extended: true }));
app.use("/", router);
// 全局错误处理中间件（必须在所有路由之后注册）
app.use(errorHandler);

const port = 3000

app.listen(port, function () {
    console.log(`Running on localhost:${port}`);
})

// TODO Projects & Activities 页面
// TODO 注释 & API 文档