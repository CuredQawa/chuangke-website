import express from 'express';
import router from './router.js'
import dotenv from 'dotenv';
import dbMiddleware from './middleware/database.js';
import authMiddleware from './middleware/auth.js';

// 从 .env 文件（项目根目录下）中加载数据库配置
dotenv.config("../");

if (!process.env.DATABASE_URL) {
    console.error("Please set the environment variable `DATABASE_URL`");
    process.exit(1);
}
// } else if (!process.env.JWT_SECRET) {
//     console.error("Please set the environment variable `JWT_SECRET`");
//     process.exit(1);
// }

const app = express();

app.use(authMiddleware);
app.use(dbMiddleware);
app.use("/", router);
app.use(express.static("public"));

const port = 3000

app.listen(port, function () {
    console.log(`Running on localhost:${port}`);
})