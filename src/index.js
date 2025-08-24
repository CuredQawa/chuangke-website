import express from 'express';
import router from './router.js'
import dbMiddleware from './middleware/database.js';
import cookieParser from 'cookie-parser';
import { RUNNING_PORT } from './constants.js';

const app = express();

app.use(express.json());
app.use(dbMiddleware);
app.use(express.static("public"));
app.use(cookieParser());
app.use("/", router);

app.listen(RUNNING_PORT, () => {
    console.log(`Running on localhost:${RUNNING_PORT}`);
})
